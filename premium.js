const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const randomTime = (max, min) => Math.floor(Math.random() * max + min);
const waitFor = (ms) => new Promise((r) => setTimeout(r, ms));
const MINUTE = 60000;

const accounts = [
	{
		user: "home@one-email.net",
		pass: "Pepper-1",
		p1:
			"https://open.spotify.com/playlist/6q5dV4hqXej4U2GhZ3mUWp?si=qhKY2-nrTnSzRzu4KPaw4Q",
		p2: "https://open.spotify.com/playlist/1abw08DLaFE7m8yhSfvhyS",
	},
	{
		user: "home+1@one-email.net",
		pass: "Hotpot-1",
		p1: "https://open.spotify.com/playlist/02hRaVuZP8cwdCO7IpVqC1",
		p2: "https://open.spotify.com/playlist/1abw08DLaFE7m8yhSfvhyS",
	},
	{
		user: "home+2@one-email.net",
		pass: "Suagry-1",
		p1:
			"https://open.spotify.com/playlist/42IQi1eifszmG0gprgrWak?si=2gSzq2yjT2Wpv-m3KdNvWw",
		p2:
			"https://open.spotify.com/playlist/1IcdR73rKLWKuzuDV7i5F3?si=x2llwe5dRlaeh_MbKxoFKg",
	},
	{
		user: "home+3@one-email.net",
		pass: "Findmyiphone-1",
		p1: "https://open.spotify.com/playlist/21jcxvrKtk2f3BTKk2Znu1",
		p2: "https://open.spotify.com/playlist/402nH9PbWHLGPBHyw1TmXH",
	},
	{
		user: "home+4@one-email.net",
		pass: "Northhill-1",
		p1:
			"https://open.spotify.com/playlist/1QnYnDfo44ZUxZMiJb3GwJ?si=qnfphIx9Qta8wzpK3aqEuQ",
		p2:
			"https://open.spotify.com/playlist/2cmvmg0EPxRjbXRyfJ7VT6?si=6iiW1Hz4TCu_6NPqp7S3mA",
	},
	{
		user: "home+5@one-email.net",
		pass: "Saltandpeper-1",
		p1: "https://open.spotify.com/playlist/0RftFt7WXxJCsPXs1bES7q",
		p2: "https://open.spotify.com/playlist/7ebMpSDpby15JcoOkkqmbY",
	},
];

const setOptions = () => {
	const options = new chrome.Options();
	options.setUserPreferences({
		"profile.default_content_setting_values.notifications": 2,
	});
	// options.addArguments("--no-sandbox");
	// options.addArguments("-disable-dev-shm-usage");
	// options.addArguments("--headless");
	return options;
};
const createDriver = (options) => {
	return new Promise((resolve) => {
		resolve(
			new Builder().forBrowser("chrome").setChromeOptions(options).build()
		);
	});
};
const openBrowser = (driver) => {
	return new Promise((resolve, reject) => {
		driver
			.get("https://open.spotify.com/browse/featured")
			.then(resolve())
			.catch((e) => reject("Fucked Browser"));
	});
};
const browseToLoginScreen = (driver) => {
	return new Promise((resolve) => {
		driver
			.wait(
				until.elementLocated(
					By.className(
						"_2221af4e93029bedeab751d04fab4b8b-scss _1edf52628d509e6baded2387f6267588-scss"
					)
				)
			)
			.then(() => {
				driver
					.findElement(
						By.className(
							"_2221af4e93029bedeab751d04fab4b8b-scss _1edf52628d509e6baded2387f6267588-scss"
						)
					)
					.click();
			})
			.then(() => {
				resolve();
			});
	});
};
const login = async (driver, user) => {
	return new Promise(async (resolve, reject) => {
		await waitFor(randomTime(2500, 2000));
		let stayLoggedIn = await driver.findElements(
			By.className("control-indicator")
		);
		if (stayLoggedIn.length > 0) await stayLoggedIn[0].click();
		await waitFor(randomTime(1000, 500));
		await driver.wait(until.elementLocated(By.id("login-username")));
		for (let i = 0; i < user.user.length; i++) {
			await waitFor(randomTime(50, 10));
			await driver.findElement(By.id("login-username")).sendKeys(user.user[i]);
		}
		await waitFor(randomTime(200, 100));
		for (let i = 0; i < user.pass.length; i++) {
			await waitFor(randomTime(50, 10));
			await driver.findElement(By.id("login-password")).sendKeys(user.pass[i]);
		}
		await waitFor(randomTime(1500, 1000));
		await driver.findElement(By.id("login-button")).click();
		await waitFor(randomTime(2000, 1000));
		const error = await driver.findElements(By.className("alert-warning"));
		if (error.length > 0) {
			reject("bad login: " + user.user + " " + user.pass);
		} else {
			resolve();
		}
	});
};

const browseToPlaylist = (driver, playlist) => {
	return new Promise((resolve, reject) => {
		driver
			.get(playlist)
			.then(resolve())
			.catch((e) => reject("Failed to get playlist"));
	});
};

const ensurePlaying = async (driver) => {
	let playing = false;
	await waitFor(3000);
	while (!playing) {
		const playBtns = await driver.findElements(
			By.xpath('//button[@aria-label="Play"]')
		);
		if (playBtns.length > 0) {
			await playBtns[1].click();
			await waitFor(5000);

			let pauseBtns = await driver.findElements(
				By.xpath('//button[@aria-label="Pause"]')
			);
			if (pauseBtns.length > 0) playing = true;
		} else {
			await waitFor(10000);
		}
	}
	console.log("Confirmed, playing");
};

const ensureShuffleOn = async (driver) => {
	const shuffleUnactive = "control-button spoticon-shuffle-16";
	const shuffleActive = "spoticon-shuffle-16 control-button--active";

	let shuffleBtnUnactive = true;
	let active = await driver.findElements(By.className(shuffleActive));
	if (active.length > 0) shuffleBtnUnactive = false;
	while (shuffleBtnUnactive) {
		let shuffleBTN = await driver.findElements(By.className(shuffleUnactive));
		await shuffleBTN[0].click();
		await waitFor(1200);
		let shuffleBTNActive = await driver.findElements(
			By.className(shuffleActive)
		);
		if (shuffleBTNActive.length > 0) shuffleBtnUnactive = false;
	}
};

const ensureLoopOn = (driver) => {
	const loopInactie = "control-button spoticon-repeat-16";
	const loopActive = "control-button spoticon-repeat-16 control-button--active";
	return new Promise((resolve) => {
		driver.findElements(By.className(loopActive)).then((elements) => {
			if (elements.length === 0) {
				driver.findElements(By.className(loopInactie)).then((elements) => {
					elements[0].click().then(() => resolve());
				});
			} else {
				resolve();
			}
		});
	});
};

const ensureLoggedIn = async (driver, account) => {
	const classNames =
		"_2221af4e93029bedeab751d04fab4b8b-scss _1edf52628d509e6baded2387f6267588-scss";
	const logInButtons = await driver.findElements(By.className(classNames));
	if (logInButtons.length > 0) {
		console.log("Having to relog in: " + account.user);
		await logInButtons[0].click();
		await waitFor(5000);
		await login(driver, account);
	}
};

const checkError = async (driver) => {
	const errorClass = "error-screen";
	let errors = await driver.findElements(By.className(errorClass));
	if (errors.length > 0) return true;
	return false;
};
const playTrack = async (driver, account, hours) => {
	await ensureLoggedIn(driver, account);
	await waitFor(randomTime(3000, 2000));
	await ensurePlaying(driver);
	await waitFor(randomTime(3000, 2000));
	await ensureShuffleOn(driver);
	await waitFor(randomTime(3000, 2000));
	await ensureLoopOn(driver);

	let minutesToPlay = hours * 60;
	for (let i = 0; i < minutesToPlay; i++) {
		console.log(i + " / " + minutesToPlay + " minutes played");
		let error = await checkError(driver);
		if (error) {
			const navigator = driver.navigate();
			navigator.refresh();
			await waitFor(10000);
		}
		await ensureLoggedIn(driver, account);
		console.log(account.user + " logged in.");
		await ensurePlaying(driver);
		console.log(account.user + " is playing.");
		await ensureShuffleOn(driver);
		console.log(account.user + " has shuffle.");
		await ensureLoopOn(driver);
		console.log(account.user + " has loop.");
		await waitFor(MINUTE);
	}

	const navigator = driver.navigate();
	navigator.refresh();
	await waitFor(10000);
	return true;
};

const startChrome = async (account) => {
	try {
		const options = setOptions();
		const driver = await createDriver(options);
		await openBrowser(driver);
		await waitFor(randomTime(5000, 4000));
		await browseToLoginScreen(driver);
		await waitFor(randomTime(5000, 4000));
		await login(driver, account);
		await waitFor(randomTime(3000, 2000));
		await run(driver, account);
	} catch (e) {
		console.log(e);
		console.log("countnt make browser");
	}
};
const run = async (driver, account) => {
	try {
		await browseToPlaylist(driver, account.p1);
		await waitFor(randomTime(3000, 2000));
		await playTrack(driver, account, 22);

		await browseToPlaylist(driver, account.p2);
		await waitFor(randomTime(3000, 2000));
		await playTrack(driver, account, 2);

		await waitFor(30000);

		run(driver, account);
	} catch (e) {
		console.log(e);
		waitFor(10000);
		run(driver, account);
	}
};

const initateAllBrowsers = async () => {
	startChrome(accounts[0]);
	await waitFor(2 * MINUTE);
	startChrome(accounts[1]);
	await waitFor(2 * MINUTE);
	startChrome(accounts[2]);
	await waitFor(2 * MINUTE);
	startChrome(accounts[3]);
	await waitFor(2 * MINUTE);
	startChrome(accounts[4]);
	await waitFor(2 * MINUTE);
	startChrome(accounts[5]);
	await waitFor(2 * MINUTE);
};

initateAllBrowsers();
