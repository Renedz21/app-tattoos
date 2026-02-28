import { describe, it, expect } from "vitest";
import { buildTattooPrompt } from "@/lib/prompts/tattoo-prompt";
import {
  TattooStyle,
  TattooSize,
  ColorMode,
} from "@/lib/generated/prisma/enums";
import type { Step1Input, Step2Input } from "@/modules/schemas/tattoo";

const baseStep1: Step1Input = {
  style: TattooStyle.FINE_LINE,
  bodyZone: "forearm",
  size: TattooSize.SMALL,
  colorMode: ColorMode.BLACK_AND_GREY,
  detailLevel: 3,
};

describe("buildTattooPrompt", () => {
  describe("with only step1", () => {
    it("includes the opening instruction line", () => {
      const prompt = buildTattooPrompt(baseStep1);
      expect(prompt).toContain("Generate a tattoo design image.");
    });

    it("includes the style", () => {
      const prompt = buildTattooPrompt(baseStep1);
      expect(prompt).toContain(`Style: ${TattooStyle.FINE_LINE}.`);
    });

    it("includes the body zone", () => {
      const prompt = buildTattooPrompt(baseStep1);
      expect(prompt).toContain("Body placement: forearm.");
    });

    it("uses size enum value when sizeNotes is absent", () => {
      const prompt = buildTattooPrompt(baseStep1);
      expect(prompt).toContain(`Size: ${TattooSize.SMALL}.`);
    });

    it("uses sizeNotes when provided instead of size enum", () => {
      const step1 = { ...baseStep1, sizeNotes: "about 5cm wide" };
      const prompt = buildTattooPrompt(step1);
      expect(prompt).toContain("Size: about 5cm wide.");
      expect(prompt).not.toContain(`Size: ${TattooSize.SMALL}.`);
    });

    it("outputs 'black and grey' for BW colorMode", () => {
      const prompt = buildTattooPrompt({
        ...baseStep1,
        colorMode: ColorMode.BLACK_AND_GREY,
      });
      expect(prompt).toContain("Color: black and grey.");
    });

    it("outputs 'color' for COLOR colorMode", () => {
      const prompt = buildTattooPrompt({
        ...baseStep1,
        colorMode: ColorMode.COLOR,
      });
      expect(prompt).toContain("Color: color.");
    });

    it("includes the detail level", () => {
      const prompt = buildTattooPrompt({ ...baseStep1, detailLevel: 5 });
      expect(prompt).toContain("Detail level (1-5): 5.");
    });

    it("does not include extra instructions line when step2 is absent", () => {
      const prompt = buildTattooPrompt(baseStep1);
      expect(prompt).not.toContain("Extra instructions:");
    });

    it("includes the closing constraints line", () => {
      const prompt = buildTattooPrompt(baseStep1);
      expect(prompt).toContain("No text. No watermark text. One image.");
    });

    it("returns lines joined by newline characters", () => {
      const prompt = buildTattooPrompt(baseStep1);
      const lines = prompt.split("\n");
      expect(lines.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("with step2", () => {
    it("includes specialInstructions when provided", () => {
      const step2: Step2Input = { specialInstructions: "add roses around it" };
      const prompt = buildTattooPrompt(baseStep1, step2);
      expect(prompt).toContain("Extra instructions: add roses around it.");
    });

    it("does not include extra instructions when specialInstructions is empty string", () => {
      const step2: Step2Input = { specialInstructions: "" };
      const prompt = buildTattooPrompt(baseStep1, step2);
      expect(prompt).not.toContain("Extra instructions:");
    });

    it("does not include extra instructions when specialInstructions is undefined", () => {
      const step2: Step2Input = { specialInstructions: undefined };
      const prompt = buildTattooPrompt(baseStep1, step2);
      expect(prompt).not.toContain("Extra instructions:");
    });

    it("includes specialInstructions verbatim", () => {
      const instructions = "Use geometric shapes and avoid shading";
      const step2: Step2Input = { specialInstructions: instructions };
      const prompt = buildTattooPrompt(baseStep1, step2);
      expect(prompt).toContain(instructions);
    });
  });

  describe("prompt line ordering", () => {
    it("opens with the instruction and closes with the constraints", () => {
      const step2: Step2Input = { specialInstructions: "bold outline" };
      const prompt = buildTattooPrompt(baseStep1, step2);
      const lines = prompt.split("\n");
      expect(lines[0]).toBe("Generate a tattoo design image.");
      expect(lines[lines.length - 1]).toBe(
        "No text. No watermark text. One image.",
      );
    });

    it("places extra instructions before the closing constraints", () => {
      const step2: Step2Input = { specialInstructions: "dotwork fill" };
      const prompt = buildTattooPrompt(baseStep1, step2);
      const lines = prompt.split("\n");
      const extraIdx = lines.findIndex((l) =>
        l.startsWith("Extra instructions:"),
      );
      const closingIdx = lines.findIndex((l) => l.startsWith("No text."));
      expect(extraIdx).toBeGreaterThan(0);
      expect(extraIdx).toBeLessThan(closingIdx);
    });
  });

  describe("style variations", () => {
    const styles = [
      TattooStyle.BLACKWORK,
      TattooStyle.REALISM,
      TattooStyle.TRADITIONAL,
      TattooStyle.LETTERING,
      TattooStyle.MINIMAL,
    ];

    for (const style of styles) {
      it(`includes style ${style} in the prompt`, () => {
        const prompt = buildTattooPrompt({ ...baseStep1, style });
        expect(prompt).toContain(`Style: ${style}.`);
      });
    }
  });

  describe("detail level boundaries", () => {
    it("includes detail level 1", () => {
      const prompt = buildTattooPrompt({ ...baseStep1, detailLevel: 1 });
      expect(prompt).toContain("Detail level (1-5): 1.");
    });

    it("includes detail level 5", () => {
      const prompt = buildTattooPrompt({ ...baseStep1, detailLevel: 5 });
      expect(prompt).toContain("Detail level (1-5): 5.");
    });
  });
});
