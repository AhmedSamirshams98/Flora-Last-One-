import React, { useEffect } from "react";
import { EmblaOptionsType } from "embla-carousel";
import { DotButton, useDotButton } from "./EmblaCarouselSliderDotButton";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "./EmblaCarouselSliderArrowButtons";

import "./emblaCarouselSlider.css";
import useEmblaCarousel from "embla-carousel-react";

type PropType = {
  slides: React.ReactNode[];
  options?: EmblaOptionsType;
};

const EmblaCarouselSlider: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  // إضافة autoplay
  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0); // العودة للبداية عند الوصول للنهاية
      }
    }, 3000); // تغيير كل 3 ثواني

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <section className="newslider">
      <div className="newslideview" ref={emblaRef}>
        <div className="slidecontainer aspect-square">
          {slides.map((slide, index) => (
            <div className="newslides" key={index}>
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className="controls">
        <div className="s">
          <PrevButton
            className="w-[3vw] md:w-[2vw] text-[#6b4423] lg:w-[1.5vw] xl:w-[1vw]"
            onClick={onPrevButtonClick}
            disabled={prevBtnDisabled}
          />
          <NextButton
            className="w-[3vw] md:w-[2vw] text-[#6b4423] lg:w-[1.5vw] xl:w-[1vw]"
            onClick={onNextButtonClick}
            disabled={nextBtnDisabled}
          />
        </div>

        {scrollSnaps.length > 1 && (
          <div className="points">
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={`point ${
                  selectedIndex === index ? "point--selected" : ""
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EmblaCarouselSlider;
