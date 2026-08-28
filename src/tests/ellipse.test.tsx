import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Ellipse } from "@/components/ui/ellipse";

describe("Ellipse", () => {
  it("treats numbers as px and passes strings through", () => {
    const { container } = render(
      <Ellipse color="var(--color-accent-deep)" width={785.5} height="86.5%" left={-40} />,
    );
    const el = container.firstElementChild as HTMLElement;

    expect(el.style.width).toBe("785.5px");
    expect(el.style.height).toBe("86.5%");
    expect(el.style.left).toBe("-40px");
    /* A token, not a literal: jsdom does not resolve custom properties, so this
       also pins that the colour reaches `background` untouched. */
    expect(el.style.background).toBe("var(--color-accent-deep)");
  });

  it("defaults to the design blur and screen blend", () => {
    const { container } = render(<Ellipse color="#fff" width={10} height={10} />);
    const el = container.firstElementChild as HTMLElement;

    expect(el.style.filter).toBe("blur(192.26px)");
    expect(el).toHaveClass("mix-blend-screen");
    expect(el).toHaveAttribute("aria-hidden");
  });

  it("is fully round by default and accepts an explicit corner radius", () => {
    const round = render(<Ellipse color="#fff" width={10} height={10} />);
    expect((round.container.firstElementChild as HTMLElement).style.borderRadius).toBe("9999px");

    const rounded = render(<Ellipse color="#fff" width={10} height={10} radius={102.3364} />);
    expect((rounded.container.lastElementChild as HTMLElement).style.borderRadius).toBe(
      "102.3364px",
    );
  });

  it("accepts an explicit blend mode and blur", () => {
    const { container } = render(
      <Ellipse color="#fff" width={10} height={10} blend="soft-light" blur="10rem" opacity={0.5} />,
    );
    const el = container.firstElementChild as HTMLElement;

    expect(el).toHaveClass("mix-blend-soft-light");
    expect(el.style.filter).toBe("blur(10rem)");
    expect(el.style.opacity).toBe("0.5");
  });
});
