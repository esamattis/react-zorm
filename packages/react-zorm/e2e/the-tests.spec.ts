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

    await input.fill("some text");
    await page.keyboard.press("Enter");

    await expect(validData).toHaveText("formdata: extra data");
    await expect(error).not.toBeVisible();
});
