import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointments';

class AppointmentController {
	async index(req, res) {
		const appointments = await Appointment.findAll({
			where: { user_id: req.userId, cancelled_at: null },
			order: ['date'],
			attributes: ['id', 'date'],
			include: [
				{
					model: User,
					as: 'provider',
					attributes: ['id', 'name'],
					include: [
						{
							model: File,
							as: 'avatar',
							attributes: ['id, path, url'],
						},
					],
				},
			],
		});

		return res.json(appointments);
	}

	async store(req, res) {
		const schema = Yup.object().shape({
			provider_id: Yup.number().required(),
			date: Yup.date().required(),
		});

		if (!(await schema.isValid(req.body))) {
			return res.status(400).json({ error: 'Validation fails' });
		}

		const { provider_id, date } = req.body;

		/*
			checck if provider_id is a provider
		*/
		const isProvider = await User.findOne({
			where: { id: provider_id, provider: true },
		});

		if (!isProvider) {
			return res
				.status(401)
				.json({ error: 'You can only create appointments with provider' });
		}
		/*
			Check for past dates
		*/

		const hourStart = startOfHour(parseISO(date));

		if (isBefore(hourStart, new Date())) {
			return res.status(401).json({ error: 'Past dates ate not permited' });
		}

		/*
		 	Check date availabitity
		*/

		const checkAvailability = await Appointment.findOne({
			where: {
				provider_id,
				cancelled_at: null,
				date: hourStart,
			},
		});

		if (checkAvailability) {
			return res
				.status(400)
				.json({ error: 'Appointment date is note available' });
		}

		const appointments = await Appointment.create({
			user_id: req.userId,
			provider_id,
			date: hourStart,
		});

		res.json(appointments);
	}
}

export default new AppointmentController();
