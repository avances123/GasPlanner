import { Gases, Gas, GasesValidator, GasMixtures, GasOptions, BestGasOptions } from './Gases';
import { DepthConverter } from './depth-converter';

describe('Gases', () => {
  // for ppo2 1.6 test data (even not used all gases with these values)
  const air = new Gas(0.21, 0); // 65.5m - 0m
  const ean50 = new Gas(0.5, 0); // 21.8m - 0m
  const trimix1835 = new Gas(0.18, 0.35); // 78.1m - 0m
  const trimix1070 = new Gas(0.1, 0.7);  // 148.5m - 7.9m
  const oxygen = new Gas(1, 0);  // 5.9m - 0m

  const options: GasOptions = {
    maxPpO2: 1.4,
    maxDecoPpO2: 1.6,
    maxEND: 30
  };

  const saltWaterConverter = DepthConverter.forSaltWater();
  const freshWaterConverter = DepthConverter.forFreshWater();

  describe('Gas', () => {
    describe('Maximum operational depth', () => {
      const ppO2 = 1.4;

      it('Oxygen with ppO2 1.6 is 6m', () => {
        const mod = oxygen.modBars(1.6);
        expect(mod).toBeCloseTo(1.6, 2);
      });

      it('Air for ppO 1.4 is 56.6 m', () => {
        let mod = air.modBars(ppO2);
        mod = Math.round(mod * 100) / 100;
        expect(mod).toBeCloseTo(6.67, 2);
      });
    });

    describe('Narcotic depth', () => {
      it('0 m in fresh water for Trimix 10/70', () => {
        const end = trimix1070.end(6, saltWaterConverter);
        expect(end).toBe(0);
      });

      describe('60 m with 18/35 trimix', () => {
        const depth = 60;

        it('is 35.38 m in fresh water', () => {
          const end = trimix1835.end(depth, freshWaterConverter);
          expect(end).toBeCloseTo(35.38, 2);
        });

        it('is 35.49 m in salt water', () => {
          const end = trimix1835.end(depth, saltWaterConverter);
          expect(end).toBeCloseTo(35.49, 2);
        });
      });
    });

    describe('Ceiling', () => {
      it('Hyperoxic nitrox 50% in fresh water to 0 m', () => {
        const ceilnig = ean50.ceiling(freshWaterConverter);
        expect(ceilnig).toBe(0);
      });

      it('Air in fresh water to 0 m', () => {
        const ceilnig = air.ceiling(freshWaterConverter);
        expect(ceilnig).toBe(0);
      });

      it('Hypooxic Trimix 10/70 in fresh water to 8 m', () => {
        const ceilnig = trimix1070.ceiling(freshWaterConverter);
        expect(ceilnig).toBeCloseTo(8.27, 2);
      });
    });
  });

  describe('Gases', () => {
    describe('Is Registered', () => {
      it('Gas as bottom gas is registered', () => {
        const gases = new Gases();
        gases.addBottomGas(air);
        const registered = gases.isRegistered(air);
        expect(registered).toBeTrue();
      });

      it('Gas as deco, gas is registered', () => {
        const gases = new Gases();
        gases.addDecoGas(air);
        const registered = gases.isRegistered(air);
        expect(registered).toBeTrue();
      });

      it('No gases, gas is not registered', () => {
        const gases = new Gases();
        const registered = gases.isRegistered(air);
        expect(registered).toBeFalse();
      });

      it('Gas is not registered', () => {
        const gases = new Gases();
        gases.addDecoGas(ean50);
        const registered = gases.isRegistered(air);
        expect(registered).toBeFalse();
      });
    });

    describe('Best gas', () => {
      const bestGasOptions: BestGasOptions = {
        maxDecoPpO2: options.maxDecoPpO2,
        maxEndPressure: 4
      };

      it('The only deco gas is found', () => {
        const gases = new Gases();
        gases.addBottomGas(air);
        gases.addDecoGas(ean50);
        const found = gases.bestDecoGas(3, bestGasOptions);
        expect(found).toBe(ean50);
      });

      it('No deco gas, bottom gas is found', () => {
        const gases = new Gases();
        gases.addBottomGas(air);
        const found = gases.bestDecoGas(3, bestGasOptions);
        expect(found).toBe(air);
      });

      it('Multiple deco gases, best is found', () => {
        const gases = new Gases();
        gases.addBottomGas(air);
        gases.addDecoGas(ean50);
        gases.addDecoGas(trimix1835);
        const found = gases.bestDecoGas(3, bestGasOptions);
        expect(found).toBe(ean50);
      });

      describe('By content', () => {
        const gases = new Gases();
        gases.addBottomGas(air);
        gases.addBottomGas(ean50);
        gases.addBottomGas(trimix1835);
        gases.addBottomGas(trimix1070);
        gases.addBottomGas(oxygen);
        
        it('Air for 30m', () => {
          const found = gases.bestDecoGas(4, bestGasOptions);
          expect(found).toBe(air);
        });

        it('Trimix 18/35 for 40m', () => {
          const found = gases.bestDecoGas(4.9, bestGasOptions);
          expect(found).toBe(trimix1835);
        });

        xit('Oxygen for 6m', () => {
          // TODO solve mod precision to oxygen at 6m
          const found = gases.bestDecoGas(1.6, bestGasOptions);
          expect(found).toBe(oxygen);
        });
      });
    });
  });

  describe('Gases validator', () => {
    const surfacePressure = freshWaterConverter.surfacePressure;
    it('No gas defined', () => {
      const messages = GasesValidator.validate(new Gases(), options, surfacePressure, 4);
      expect(messages.length).toBe(1);
    });

    it('Only one gas', () => {
      const gases = new Gases();
      gases.addBottomGas(air);
      const messages = GasesValidator.validate(gases, options, surfacePressure, 4);
      expect(messages.length).toBe(0);
    });

    it('No bottom gas for depth', () => {
      const gases = new Gases();
      gases.addBottomGas(air);
      const messages = GasesValidator.validate(gases, options, surfacePressure, 11);
      expect(messages.length).toBe(1);
    });

    it('No gas to surface', () => {
      const gases = new Gases();
      gases.addBottomGas(trimix1070);
      const messages = GasesValidator.validate(gases, options, surfacePressure, 4);
      expect(messages.length).toBe(1);
    });

    it('Gases don`t cover all depths', () => {
      const bottomGases = [trimix1070];
      const decoGases = [oxygen];
      const gases = new Gases();
      gases.addBottomGas(trimix1070);
      gases.addDecoGas(oxygen);
      const messages = GasesValidator.validate(gases, options, surfacePressure, 4);
      expect(messages.length).toBe(1);
    });

    it('Multiple gases', () => {
      const gases = new Gases();
      gases.addBottomGas(air);
      gases.addDecoGas(ean50);
      const messages = GasesValidator.validate(gases, options, surfacePressure, 4);
      expect(messages.length).toBe(0);
    });
  });

  describe('Gas partial pressures', () => {
    it('At 1 bar 0.79 volume fraction converts to ', () => {
      const result = GasMixtures.partialPressure(1, 0.79);
      expect(result).toBe(0.79);
    });

    it('At 3 bar 0.79 volume fraction converts to ', () => {
      const result = GasMixtures.partialPressure(6.667, 0.21);
      expect(result).toBeCloseTo(1.40, 3);
    });

    it('At 0 bars any fraction results in 0 partial pressure', () => {
      const result = GasMixtures.partialPressure(0, 0.79);
      expect(result).toBe(0);
    });

    it('At any bars 0 fraction results in 0 partial pressure', () => {
      const result = GasMixtures.partialPressure(3, 0);
      expect(result).toBe(0);
    });
  });

  describe('Gas composition equality', () => {
    it('Equals to null returns false', () => {
      expect(air.compositionEquals(null)).toBeFalsy();
    });

    it('Equals to the same content of oxygen and helium returns true', () => {
      const other = new Gas(.21, 0);
      expect(air.compositionEquals(other)).toBeTruthy();
    });

    it('Equals to different helium content returns false', () => {
      const other = new Gas(.21, .2);
      expect(air.compositionEquals(other)).toBeFalsy();
    });

    it('Equals to different oxygen content returns false', () => {
      expect(air.compositionEquals(ean50)).toBeFalsy();
    });
  });
});
