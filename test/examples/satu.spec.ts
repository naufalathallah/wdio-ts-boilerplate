import { expect } from "@wdio/globals";
import LoginPage from "../pageobjects/login.page";
import SecurePage from "../pageobjects/secure.page";

describe("My Login satu", () => {
  it("[key: TD-T2157] User klik button Yakin pada bottomsheet konfirmasi email pesan layanan saat pesan satu layanan homecare", async () => {
    await LoginPage.open();

    await LoginPage.login("tomsmith", "SuperSecretPassword!");
    await expect(SecurePage.flashAlert).toBeExisting();
    await expect(SecurePage.flashAlert).toHaveTextContaining("You logged into a secure area!");
  });
});
