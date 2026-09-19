import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("./");
});

test("seed editing updates the canonical palette and persists", async ({ page }) => {
  const hexInput = page.getByRole("textbox", { name: "HEX" });

  await hexInput.fill("#FF0000");
  await expect(page.getByText("rgb(255, 0, 0)")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy brand 500 color #FF0000" }),
  ).toBeVisible();

  await page.reload();
  await expect(hexInput).toHaveValue("#FF0000");
});

test("invalid drafts are reported without destroying the last valid color", async ({
  page,
}) => {
  const hexInput = page.getByRole("textbox", { name: "HEX" });

  await hexInput.fill("#22C55E");
  await hexInput.fill("not-a-color");

  await expect(page.getByRole("alert")).toContainText("valid 3 or 6 digit HEX");
  await expect(
    page.getByRole("button", { name: "Copy brand 500 color #22C55E" }),
  ).toBeVisible();
});

test("contrast output and export are present", async ({ page }) => {
  await expect(page.getByText("On white")).toBeVisible();
  await expect(page.getByText("On black")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy CSS tokens" })).toBeVisible();
  await expect(page.locator("pre")).toContainText("--color-brand-500");
});

test("main states have no serious WCAG A/AA axe violations", async ({ page }) => {
  const initial = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(initial.violations).toEqual([]);

  await page.getByRole("textbox", { name: "HEX" }).fill("#F43F5E");
  const changed = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(changed.violations).toEqual([]);
});

test("layout does not overflow the viewport", async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(1);
});
