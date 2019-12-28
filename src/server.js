import app from './app';

app.listen(process.env.APP_PORT, () => {
	// eslint-disable-next-line no-console
	console.log('server is running');
});
