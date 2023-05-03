import { defineStore } from "pinia";
import type { LoggedInUser, LoginInformation } from "@/types/auth";
import { isTypeLoggedInUser, LoginState } from "@/types/auth";
import { watch } from "vue";

function loadUserDataFromJSON(): null | LoggedInUser {
	//Get value from store:
	const storeData = window.localStorage.getItem("user");
	if (storeData === null) {
		//No user data stored, ignore.
		return null;
	}
	let json;
	try {
		json = JSON.parse(storeData);
	} catch (e) {
		console.error("Could not parse user in local storage as JSON:", e, storeData);
		return null;
	}
	if (!isTypeLoggedInUser(json)) {
		//Whops there is junk in the json:
		console.error("Could not parse user in local storage:", json);
		return null;
	}
	return json;
}

export const useAuthStore = defineStore("auth", {
	//As per recommendation of Pinia Doc: Start with Options API. Composition would work too - to be debated later.
	state: () => ({
		loginInformation: {
			loginState: LoginState.WaitingForTermsAndPrivacy,
			acceptPP: false,
			acceptTOS: false,
			serverChallenge: null,
			messagesToDelete: null,
			apiErrorMessage: null,
		} as LoginInformation,
		currentUser: null as null | LoggedInUser,
	}),
	getters: {
		isLoggedIn: (state): boolean => {
			return state.currentUser !== null;
		},
		getAvatar: (state): string => {
			if (state.currentUser === null || state.currentUser.picture === null) {
				return "https://assets.logicworld.net/img/default-user.png";
			}
			return "https://assets.logicworld.net/upload/" + state.currentUser.picture;
		},
	},
	actions: {
		resetLoginState(): void {
			this.loginInformation.acceptPP = false;
			this.loginInformation.acceptTOS = false;
			this.loginInformation.serverChallenge = null;
			this.loginInformation.messagesToDelete = null;
			this.loginInformation.apiErrorMessage = null;
			this.loginInformation.loginState = this.currentUser === null ? LoginState.WaitingForTermsAndPrivacy : LoginState.LoggedIn;
		},
	}
});

export function setupAuthStore(): void {
	const store = useAuthStore(window.__pinia);
	
	//Listen to local storage changes, if the current user changed, update this in this instance too.
	addEventListener('storage', (event: StorageEvent): void => {
		if (event.key !== 'user') {
			return; //Not relevant!
		}
		const newUser = loadUserDataFromJSON();
		if (store.currentUser === null) {
			if (newUser === null) {
				return; //No change!
			} else {
				//Login!
				store.currentUser = newUser;
			}
		} else {
			if (newUser === null) {
				//Logout!
				store.currentUser = null;
			} else {
				//User changed? Compare values!
				if (
					newUser.username !== store.currentUser.username
					|| newUser.picture !== store.currentUser.picture
					|| newUser.token !== store.currentUser.token
					|| newUser.identifier !== store.currentUser.identifier
				) {
					//User changed!
					store.currentUser = newUser;
				} //else no change.
			}
		}
		console.log("The storage got changed by another instance:", event);
	});
	
	//Handle when the value of the current user changes:
	watch(() => store.currentUser, (newValue: LoggedInUser | null, oldValue: LoggedInUser | null): void => {
		//Handle the actual logging in/out:
		if (newValue === null && oldValue !== null) {
			//Logout!
			//Delete from local storage:
			window.localStorage.removeItem("user");
			store.resetLoginState();
			console.info("Logged out.");
		} else if (newValue !== null) {
			if (oldValue !== null) {
				//Switch!
				console.warn("Tried to login - but already logged in!");
			}
			//Login!
			//Save to local storage:
			window.localStorage.setItem("user", JSON.stringify(newValue));
			store.resetLoginState();
			console.info("Logged in as " + newValue.username);
		}
	});
	
	//Initialize the user value - while also triggering the side effects.
	// Side effect is that the login information is also modified.
	store.currentUser = loadUserDataFromJSON();
}
