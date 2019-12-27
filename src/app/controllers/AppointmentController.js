import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';
import Mail from '../../lib/Mail';

class AppointmentController {
	async index(req, res) {
		// paginação
		const { page = 1 } = req.query;

		const appointments = await Appointment.findAll({
			where: { user_id: req.userId, cancelled_at: null },
			order: ['date'],
			attributes: ['id', 'date'],
			limit: 20,
			offset: (page - 1) * 20,
			include: [
				{
					model: User,
					as: 'provider',
					attributes: ['id', 'name'],
					include: [
						{
							model: File,
							as: 'avatar',
							attributes: ['id', 'path', 'url'],
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
		const checkIsProvider = await User.findOne({
			where: { id: provider_id, provider: true },
		});

		if (!checkIsProvider) {
			return res
				.status(401)
				.json({ error: 'You can only create appointments with provider' });
		}

		/*
		 * Check is provider_id is not equal a authentication user
		 */

		if (provider_id === req.userId) {
			return res
				.status(401)
				.json({ error: 'You cant create appointmets with yourserf' });
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

		/*
		 *	Notify appointment provider
		 */
		const user = await User.findByPk(req.userId);
		const formatedDate = format(hourStart, "'dia' dd 'de' MMMM', às' H:mm'h'", {
			locale: pt,
		});

		await Notification.create({
			content: `Novo agendamento de ${user.name} para o ${formatedDate}`,
			user: provider_id,
		});

		return res.json(appointments);
	}

	async delete(req, res) {
		const appointment = await Appointment.findByPk(req.params.id, {
			include: [
				{
					model: User,
					as: 'provider',
					attributes: ['name', 'email'],
				},
			],
		});

		if (appointment.user_id !== req.userId) {
			return res.status(401).json({
				error: "You don't have permission to cancel this appointment",
			});
		}

		const dateWithSub = subHours(appointment.date, 2);

		/*
		 * Check if cancelled hour is before 2 hours from appointment
		 */

		if (isBefore(dateWithSub, new Date())) {
			res.status(401).json({
				error: 'You can only cancel appointment 2 hours in advance',
			});
		}

		/*
			Update field cancelled_at afeter success cancelled
		*/

		appointment.cancelled_at = new Date();

		await appointment.save();

		await Mail.sendMail({
			to: `${appointment.provider.name} <${appointment.provider.email}>`,
			subject: 'Agendamento cancelado',
			text: 'Você tem um novo cancemalento',
		});

		return res.json(appointment);
	}
}

export default new AppointmentController();
