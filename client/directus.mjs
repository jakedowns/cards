import { Directus } from '@directus/sdk';

import dotenv from "dotenv"
dotenv.config();

const directus = await new Directus(process.env?.DIRECTUS_URL,{
    auth:{
        staticToken: process.env?.DIRECTUS_API_TOKEN ?? '',
    }
});

const StartDirectus = async function () {

	// We don't need to authenticate if data is public
    // try {
    //     const publicData = await directus.items('public').readByQuery({ meta: 'total_count' });
    //     console.warn(
    //         'publicData',{
    //         items: publicData.data,
    //         total: publicData.meta.total_count,
    //     });
    // }catch(e){
    //     console.error(e)
    // }

	// But, we need to authenticate if data is private
	// let authenticated = false;

	// Try to authenticate with token if exists
	// await directus.auth
	// 	.refresh()
	// 	.then(() => {
	// 		authenticated = true;
	// 	})
	// 	.catch((err) => {
    //         console.error(err)
    //     });

	// Let's login in case we don't have token or it is invalid / expired
	// while (!authenticated) {
	// 	const email = 'mail@jakedowns.com';// window.prompt('Email:');
	// 	const password = window.prompt('Password:');

	// 	await directus.auth
	// 		.login({ email, password })
	// 		.then(() => {
	// 			authenticated = true;
	// 		})
	// 		.catch((err) => {
	// 			window.alert('Invalid credentials',err);
	// 		});
	// }

	// After authentication, we can fetch the private data in case the user has access to it
	// const privateData = await directus.items('Games').readByQuery({ meta: 'total_count' });

	// console.warn('privateData', {
	// 	items: privateData.data,
	// 	total: privateData.meta.total_count,
	// });

    return directus;
}

export default StartDirectus