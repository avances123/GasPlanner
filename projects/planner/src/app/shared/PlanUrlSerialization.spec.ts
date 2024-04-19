import { OptionsService } from './options.service';
import { PlannerService } from './planner.service';
import { PlanUrlSerialization } from './PlanUrlSerialization';
import { Preferences } from './preferences';
import { WorkersFactoryCommon } from './serial.workers.factory';
import { TanksService } from './tanks.service';
import { UnitConversion } from './UnitConversion';
import { ViewStates } from './viewStates';
import { ViewSwitchService } from './viewSwitchService';
import { DepthsService } from './depths.service';
import { ReloadDispatcher } from './reloadDispatcher';
import { DiveSchedules } from './dive.schedules';

class TestSut {
    constructor(
        public schedules: DiveSchedules,
        public planner: PlannerService,
        public viewSwitch: ViewSwitchService,
        public units: UnitConversion,
        public urlSerialization: PlanUrlSerialization) {
    }

    public get options(): OptionsService {
        return this.schedules.selectedOptions;
    }

    public get depths(): DepthsService {
        return this.schedules.selectedDepths;
    }

    public get tanksService(): TanksService {
        return this.schedules.selectedTanks;
    }
}

// TODO test cases
// * Load of current dive (Refresh page) - does not add new dive
// * From url - adds new dive
fdescribe('Url Serialization', () => {
    const irrelevantFactory = new WorkersFactoryCommon();

    // because we need custom instances to compare
    const createSut = (imperial = false): TestSut => {
        const units = new UnitConversion();
        const dispatcher = new ReloadDispatcher();
        units.imperialUnits = imperial;
        const schedules = new DiveSchedules(units, dispatcher);
        const viewSwitch = new ViewSwitchService(schedules);
        const planner = new PlannerService(schedules, dispatcher, viewSwitch, irrelevantFactory, units);
        const preferences = new Preferences(viewSwitch, units, schedules, new ViewStates());
        const urlSerialization = new PlanUrlSerialization(viewSwitch, units, schedules, preferences);
        const firstDive = schedules.dives[0];
        firstDive.depths.setSimple();
        return new TestSut(schedules, planner, viewSwitch, units,  urlSerialization);
    };

    const createCustomSut = () => {
        const created = createSut();
        created.viewSwitch.isComplex = true;
        created.tanksService.addTank();
        created.depths.addSegment();
        created.planner.calculate(1);
        return created;
    };

    /** in metric */
    let sut: TestSut;
    let customizedUrl: string;

    beforeEach(() => {
        sut = createCustomSut();
        customizedUrl = sut.urlSerialization.toUrl();
    });

    const expectParsedEquals = (current: TestSut): void => {
        const toExpect = {
            plan: sut.depths.segments,
            tanks: sut.tanksService.tankData,
            diver: sut.options.getDiver(),
            options: sut.options.getOptions(),
            isComplex: sut.viewSwitch.isComplex
        };

        const toCompare = {
            plan: current.depths.segments,
            tanks: current.tanksService.tankData,
            diver: current.options.getDiver(),
            options: current.options.getOptions(),
            isComplex: current.viewSwitch.isComplex
        };

        expect(toCompare).toEqual(toExpect);
    };

    it('Generates valid url characters', () => {
        const isValid = /[-a-zA-Z0-9@:%_+.~#&//=]*/g.test(customizedUrl);
        expect(isValid).toBeTruthy();
    });

    it('Generates url of selected dive for multiple dives', () => {
        sut.schedules.add();
        sut.schedules.selected = sut.schedules.dives[0];
        const url = sut.urlSerialization.toUrl();
        const urlExpected = sut.urlSerialization.toUrlFor(sut.schedules.dives[0].id);
        expect(urlExpected).toEqual(url);
    });

    it('Serialize application options', () => {
        sut.viewSwitch.isComplex = true;
        sut.units.imperialUnits = true;
        const url = sut.urlSerialization.toUrl();
        expect(url).toContain('ao=1,1');
    });

    xit('Serialize and deserialize complex plan',() => {
        const current = createSut();
        current.urlSerialization.fromUrl(customizedUrl);
        current.planner.calculate(1);
        expectParsedEquals(current);
    });

    xit('Serialize and deserialize simple plan', () => {
        const simpleSut = createSut();
        simpleSut.tanksService.tanks[0].size = 18;
        simpleSut.planner.calculate(1);
        const urlParams = simpleSut.urlSerialization.toUrl();
        sut.urlSerialization.fromUrl(urlParams);
        sut.planner.calculate(1);
        expectParsedEquals(simpleSut);
    });

    it('Decodes url for facebook link', () => {
        const encodedParams = encodeURIComponent(customizedUrl);
        const current = createSut();
        current.urlSerialization.fromUrl(encodedParams);
        current.schedules.remove(current.schedules.dives[0]); // because the dive was added
        current.planner.calculate(1);
        expectParsedEquals(current);
    });

    it('Complex plan in imperial units still generates url below 2048 characters', () => {
        const current = createSut(true);
        // tests the limits of url serialization
        // long enough with precise imperial values, still bellow 2k characters
        // consider rounding the workPressure to 3 digits to shorten,
        // since it leads to not loosing precision on tank size on first 3 decimals
        for (let index = 0; index < 22; index++) {
            current.tanksService.addTank();
            current.depths.addSegment();
        }

        const result = current.urlSerialization.toUrl();
        expect(result.length).toBeLessThan(2048);
    });

    describe('Restore switching units', () => {
        xit('From metric units', () => {
            sut.tanksService.firstTank.size = 24;
            const url = sut.urlSerialization.toUrl();
            const current = createSut(true);
            current.tanksService.firstTank.workingPressure = 250;
            current.urlSerialization.fromUrl(url);

            const firstTank = current.tanksService.firstTank;
            // since working pressure is the main difference and affects size
            expect(firstTank.workingPressureBars).toBeCloseTo(0, 3);
            expect(firstTank.size).toBeCloseTo(24, 3);
        });

        xit('From imperial units', () => {
            const current = createSut(true);
            current.tanksService.firstTank.size = 240;
            const url = current.urlSerialization.toUrl();
            sut.urlSerialization.fromUrl(url);

            const firstTank = sut.tanksService.firstTank;
            expect(firstTank.workingPressure).toBeCloseTo(3442, 3);
            expect(firstTank.size).toBeCloseTo(240, 3);
        });

        xit('Switching units corrects out of metric range values', () => {
            const current = createSut(true);
            // still valid value in imperial, but not in metric
            current.tanksService.firstTank.size = 1;
            const url = current.urlSerialization.toUrl();
            sut.urlSerialization.fromUrl(url);

            const firstTank = sut.tanksService.firstTank;
            expect(firstTank.size).toBeCloseTo(1, 3);
        });
    });

    describe('Skips loading', () => {
        const assertImported = (urlParams: string): void => {
            const current = createCustomSut();
            current.urlSerialization.fromUrl(urlParams);
            expectParsedEquals(current);
        };

        it('Invalid url values', () => {
            // 2 tanks in simple mode, which isn't valid
            const urlParams = 't=1-15-0-210-0.209-0,2-11-0-200-0.5-0&de=0-30-102-1,30-30-618-1&' +
                'di=20&o=0,9,6,3,3,18,2,0.85,0.4,3,1.6,30,1.4,10,1,1,0,2,1&ao=0,0';
            assertImported(urlParams);
        });

        it('Invalid working pressure in metric', () => {
            const urlParams = 't=1-15-220-210-0.209-0,2-11.1-0-200-0.209-0&de=0-30-102-1,30-30-618-1,30-30-600-1&' +
                'di=20&o=0,9,6,3,3,18,2,0.85,0.4,3,1.6,30,1.4,10,1,1,0,2,1&ao=1,0';
            assertImported(urlParams);
        });

        it('Invalid working pressure in imperial', () => {
            const urlParams = 't=1-15-220-210-0.209-0,2-11.1-0-200-0.209-0&de=0-30-102-1,30-30-618-1,30-30-600-1&' +
                'di=20&o=0,9,6,3,3,18,2,0.85,0.4,3,1.6,30,1.4,10,1,1,0,2,1&ao=1,1';
            const current = createCustomSut();
            current.urlSerialization.fromUrl(urlParams);
            expectParsedEquals(current);
        });

        it('Empty string', () => {
            assertImported('');
        });

        it('Null string', () => {
            const planUrl: unknown = null;
            assertImported(<string>planUrl);
        });
    });
});
