import { Component, OnInit } from '@angular/core';
import { faBatteryHalf } from '@fortawesome/free-solid-svg-icons';
import { PlannerService } from '../shared/planner.service';
import { RangeConstants, UnitConversion } from '../shared/UnitConversion';
import { DelayedScheduleService } from '../shared/delayedSchedule.service';
import { GasToxicity } from '../shared/gasToxicity.service';
import { takeUntil } from 'rxjs';
import { NonNullableFormBuilder, FormGroup, FormControl } from '@angular/forms';
import { InputControls } from '../shared/inputcontrols';
import { ValidatorGroups } from '../shared/ValidatorGroups';
import { Streamed } from '../shared/streamed';
import { TankBound } from '../shared/models';
import { TanksService } from '../shared/tanks.service';
import { Plan } from '../shared/plan.service';
import { Precision } from 'scuba-physics';

interface TankForm {
    firstTankSize: FormControl<number>;
    firstTankStartPressure: FormControl<number>;
}

@Component({
    selector: 'app-tanks-simple',
    templateUrl: './tanks-simple.component.html',
    styleUrls: ['./tanks-simple.component.scss']
})
export class TanksSimpleComponent extends Streamed implements OnInit {
    public icon = faBatteryHalf;
    public toxicity: GasToxicity;
    public tanksForm!: FormGroup<TankForm>;

    constructor(private planner: PlannerService,
        private tanksService: TanksService,
        public units: UnitConversion,
        private fb: NonNullableFormBuilder,
        private inputs: InputControls,
        private validators: ValidatorGroups,
        private delayedCalc: DelayedScheduleService,
        private plan: Plan) {
        super();
        this.toxicity = new GasToxicity(this.planner.options);
    }

    public get firstTank(): TankBound {
        return this.tanksService.firstTank;
    }

    public get ranges(): RangeConstants {
        return this.units.ranges;
    }

    public get firstTankSizeInvalid(): boolean {
        const firstTankSize = this.tanksForm.controls.firstTankSize;
        return this.inputs.controlInValid(firstTankSize);
    }

    public get firstTankStartPressureInvalid(): boolean {
        const firstTankStartPressure = this.tanksForm.controls.firstTankStartPressure;
        return this.inputs.controlInValid(firstTankStartPressure);
    }

    public ngOnInit(): void {
        this.tanksForm = this.fb.group({
            firstTankSize: [Precision.round(this.firstTank.size, 1), this.validators.tankSize],
            firstTankStartPressure: [Precision.round(this.firstTank.startPressure, 1), this.validators.tankPressure]
        });

        this.tanksService.tanksReloaded.pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => this.reloadAll());
    }

    public gasSac(): number {
        const tank = this.firstTank.tank;
        const sac = this.planner.diver.gasSac(tank);
        return this.units.fromBar(sac);
    }

    public assignBestMix(): void {
        const maxDepth = this.plan.maxDepth;
        this.firstTank.o2 = this.toxicity.bestNitroxMix(maxDepth);
        this.delayedCalc.schedule();
    }

    public applySimple(): void {
        if (this.tanksForm.invalid) {
            return;
        }

        const values = this.tanksForm.value;
        this.firstTank.size = Number(values.firstTankSize);
        this.firstTank.startPressure = Number(values.firstTankStartPressure);
        this.delayedCalc.schedule();
    }

    private reloadAll(): void {
        this.tanksForm.patchValue({
            firstTankSize: Precision.round(this.firstTank.size, 1),
            firstTankStartPressure: Precision.round(this.firstTank.startPressure, 1),
        });
    }
}
