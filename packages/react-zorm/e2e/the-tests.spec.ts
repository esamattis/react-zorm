import { test, expect } from "@playwright/test";

test("validates on blur after first submit", async ({ page }) => {
    await page.goto("/?test=validate-on-blur");
    const error = page.locator(".error");
    const input = page.locator("input");

    await expect(error).not.toBeVisible();
    await input.fill("a");
    await page.keyboard.press("Enter");
    await expect(error).toBeVisible();

    await input.fill("long enough");

    // Remove focus from input and it sould validate
    await page.locator("body").click();
    await expect(error).not.toBeVisible();

    // Should valiate on blur again
    await input.fill("s");
    await page.locator("body").click();
    await expect(error).toBeVisible();
});

test("can use the formdata inject data", async ({ page }) => {
    await page.goto("/?test=formdata-event");
    const error = page.locator(".error");
    const input = page.locator("input");
    const validData = page.locator(".valid-data");
    const setExtraButton = page.locator("button", { hasText: "set extra" });

    await setExtraButton.click();
    await input.fill("some text");
    await page.keyboard.press("Enter");

    await expect(validData).toHaveText("formdata: extra data");
    await expect(error).not.toBeVisible();
});

test("validates on html errors", async ({ page }) => {
    await page.goto("/?test=invalid-event");
    const error = page.locator(".error");
    const input = page.locator("input");

    await input.focus();
    await page.keyboard.press("Enter");

    // Constraint Validation API works
    // https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#the_constraint_validation_api
    const valueMissing = await page.evaluate(() => {
        const input = document.querySelector("form input");
        if (!(input instanceof HTMLInputElement)) {
            throw new Error("input not found");
        }

        return input.validity.valueMissing;
    });

    expect(valueMissing).toBe(true);

    // Zorm errors are rendered
    await expect(error).toHaveText("input: too_small");
});
