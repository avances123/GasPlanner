import { DecimalPipe } from '@angular/common';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { DelayedScheduleService } from '../shared/delayedSchedule.service';
import { InputControls } from '../shared/inputcontrols';
import { OptionsDispatcherService } from '../shared/options-dispatcher.service';
import { Plan } from '../shared/plan.service';
import { PlannerService } from '../shared/planner.service';
import { WorkersFactoryCommon } from '../shared/serial.workers.factory';
import { TanksService } from '../shared/tanks.service';
import { UnitConversion } from '../shared/UnitConversion';
import { ValidatorGroups } from '../shared/ValidatorGroups';
import { ViewSwitchService } from '../shared/viewSwitchService';
import { DiveOptionsComponent } from './diveoptions.component';

describe('DepthComponent', () => {
    let component: DiveOptionsComponent;
    let fixture: ComponentFixture<DiveOptionsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DiveOptionsComponent],
            imports: [ReactiveFormsModule],
            providers: [WorkersFactoryCommon, DecimalPipe,
                OptionsDispatcherService, InputControls,
                ValidatorGroups, PlannerService,
                DelayedScheduleService, UnitConversion,
                TanksService, Plan, ViewSwitchService
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DiveOptionsComponent);
        component = fixture.componentInstance;
    });

    describe('Imperial units', () => {
        beforeEach(() => {
            component.units.imperialUnits = true;
            fixture.detectChanges();
        });

        it('Altitude bound to imperial', () => {
            component.options.maxEND = 30;
            expect(component.maxEND).toBeCloseTo(98.425197, 6);
        });

        it('Last stop depth bound to imperial', () => {
            component.lastStopDepth = 10;
            expect(component.options.lastStopDepth).toBeCloseTo(3.048, 6);
        });

        it('Descent speed bound to imperial', () => {
            component.descentSpeed = 10;
            expect(component.options.descentSpeed).toBeCloseTo(3.048, 6);
        });

        it('Ascent speed to 50% bound to imperial', () => {
            component.ascentSpeed50perc = 10;
            expect(component.options.ascentSpeed50perc).toBeCloseTo(3.048, 6);
        });

        it('Ascent speed 50% to 6 m bound to imperial', () => {
            component.ascentSpeed50percTo6m = 10;
            expect(component.options.ascentSpeed50percTo6m).toBeCloseTo(3.048, 6);
        });

        it('Ascent speed from 6 m bound to imperial', () => {
            component.ascentSpeed6m = 10;
            expect(component.options.ascentSpeed6m).toBeCloseTo(3.048, 6);
        });
    });

    it('Set complex calls wiew switch', inject([ViewSwitchService], (viewSwitch: ViewSwitchService) => {
        const spy = spyOnProperty(viewSwitch, 'isComplex', 'set')
            .and.callThrough();
        fixture.detectChanges();
        component.isComplex = false;
        expect(spy).toHaveBeenCalledWith(false);
    }));
});
