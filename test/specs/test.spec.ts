import { expect } from "@wdio/globals";
import LoginPage from "../pageobjects/login.page";
import SecurePage from "../pageobjects/secure.page";

describe("My Login application", () => {
  it("[key: TD-T2160] User cek button back pada halaman Ringkasan Order", async () => {
    await LoginPage.open();

    await LoginPage.login("tomsmiths", "SuperSecretPassword!");
    await expect(SecurePage.flashAlert).toBeExisting();
    await expect(SecurePage.flashAlert).toHaveTextContaining("You logged into a secure area!");
  });
});
