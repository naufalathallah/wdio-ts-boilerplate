import { expect } from "@wdio/globals";
import LoginPage from "../pageobjects/login.page";
import SecurePage from "../pageobjects/secure.page";

describe("My Login tiga", () => {
  it("[key: TD-T2159] User klik button Yakin pada bottomsheet konfirmasi email pesan layanan saat pesan multiple layanan", async () => {
    await LoginPage.open();

    await LoginPage.login("tomsmithError", "SuperSecretPassword!");
    await expect(SecurePage.flashAlert).toBeExisting();
    await expect(SecurePage.flashAlert).toHaveTextContaining("You logged into a secure area!");
  });
});
