import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, NonNullableFormBuilder, FormGroup } from '@angular/forms';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';

import { SacCalculatorService } from '../shared/sac-calculator.service';
import { PlannerService } from '../shared/planner.service';
import { RangeConstants, UnitConversion } from '../shared/UnitConversion';
import { Diver, ImperialUnits, Precision, TankConstants } from 'scuba-physics';
import { InputControls } from '../shared/inputcontrols';
import { TextConstants } from '../shared/TextConstants';
import { ValidatorGroups } from '../shared/ValidatorGroups';

interface SacForm {
    depth: FormControl<number>;
    tankSize: FormControl<number>;
    workPressure: FormControl<number>;
    used?: FormControl<number>;
    duration?: FormControl<number>;
    rmv?: FormControl<number>;
}

@Component({
    selector: 'app-sac',
    templateUrl: './sac.component.html',
    styleUrls: ['./sac.component.scss']
})
export class SacComponent implements OnInit {
    public calcIcon = faCalculator;
    public formSac!: FormGroup<SacForm>;
    public depthConverterWarning = TextConstants.depthConverterWarning;
    private workingPressure = ImperialUnits.defaultWorkingPressure;
    private durationControl!: FormControl<number>;
    private rmvControl!: FormControl<number>;
    private usedControl!: FormControl<number>;

    constructor(
        private validators: ValidatorGroups,
        private inputs: InputControls,
        private formBuilder: NonNullableFormBuilder,
        private router: Router,
        private planer: PlannerService,
        private cd: ChangeDetectorRef,
        public calc: SacCalculatorService,
        public units: UnitConversion) {
    }

    public get ranges(): RangeConstants {
        return this.units.ranges;
    }

    public get depthInvalid(): boolean {
        const depth = this.formSac.controls.depth;
        return this.inputs.controlInValid(depth);
    }

    public get tankInvalid(): boolean {
        const tankSize = this.formSac.controls.tankSize;
        return this.inputs.controlInValid(tankSize);
    }

    public get workPressureInvalid(): boolean {
        const workPressure = this.formSac.controls.workPressure;
        return this.inputs.controlInValid(workPressure);
    }

    public get usedInvalid(): boolean {
        const used = this.formSac.controls.used;
        return this.inputs.controlInValid(used);
    }

    public get rmvInvalid(): boolean {
        const rmv = this.formSac.controls.rmv;
        return this.inputs.controlInValid(rmv);
    }

    public get durationInvalid(): boolean {
        const duration = this.formSac.controls.duration;
        return this.inputs.controlInValid(duration);
    }

    public get calcDepth(): number {
        const depth = this.units.fromMeters(this.calc.depth);
        return Precision.round(depth, 1);
    }

    public get calcTankSize(): number {
        const tank = this.units.fromTankLiters(this.calc.tank, this.workingPressure);
        return Precision.round(tank, 1);
    }

    public get calcWorkingPressure(): number {
        const workPressure = this.units.fromBar(this.workingPressure);
        return Precision.round(workPressure, 1);
    }

    public get calcUsed(): number {
        const used = this.units.fromBar(this.calc.used);
        return Precision.round(used, 1);
    }

    public get calcRmv(): number {
        const rmv = this.units.fromLiter(this.calc.rmv);
        const roundTo = this.units.imperialUnits ? 4 : 2;
        return Precision.round(rmv, roundTo);
    }

    public get calcDuration(): number {
        const duration = this.calc.duration;
        return Precision.round(duration);
    }

    public get gasSac(): number {
        const sac = Diver.gasSac(this.calc.rmv, this.calc.tank);
        return this.units.fromBar(sac);
    }

    public ngOnInit(): void {
        this.setDefaultValues();

        this.durationControl = this.formBuilder.control(this.calcDuration, this.validators.duration);
        this.usedControl = this.formBuilder.control(this.calcUsed, this.validators.tankPressure);
        this.rmvControl = this.formBuilder.control(this.calcRmv, this.validators.diverRmv);

        this.formSac = this.formBuilder.group({
            depth: [this.calcDepth, this.validators.depth],
            tankSize: [this.calcTankSize, this.validators.tankSize],
            workPressure: [this.calcWorkingPressure, this.validators.tankPressure]
        });

        this.toSac();
    }

    public inputChanged(): void {
        if (this.formSac.invalid) {
            return;
        }

        const values = this.formSac.value;
        this.workingPressure = this.units.toBar(Number(values.workPressure));
        this.calc.tank = this.units.toTankLiters(Number(values.tankSize), this.workingPressure);
        this.calc.depth = this.units.toMeters(Number(values.depth));
        this.calc.used = this.units.toBar(Number(values.used));
        this.calc.rmv = this.units.toLiter(Number(values.rmv));
        this.calc.duration = Number(values.duration);

        this.reload();
    }

    public toDuration(): void {
        this.calc.toDuration();
        this.enableAll();
        this.formSac.removeControl('duration');
        this.cd.detectChanges();
    }

    public toUsed(): void {
        this.calc.toUsed();
        this.enableAll();
        this.formSac.removeControl('used');
        this.cd.detectChanges();
    }

    public toSac(): void {
        this.calc.toSac();
        this.enableAll();
        this.formSac.removeControl('rmv');
        this.cd.detectChanges();
    }

    public async goBack(): Promise<boolean> {
        return await this.router.navigateByUrl('/');
    }

    public use(): void {
        if (this.formSac.invalid) {
            return;
        }

        this.planer.diver.rmv = this.calc.rmv;
    }

    private enableAll(): void {
        this.formSac.addControl('used', this.usedControl);
        this.formSac.addControl('duration', this.durationControl);
        this.formSac.addControl('rmv', this.rmvControl);
        this.reload();
    }

    private reload(): void {
        this.formSac.patchValue({
            depth: this.calcDepth,
            tankSize: this.calcTankSize,
            workPressure: this.calcWorkingPressure,
            used: this.calcUsed,
            duration: this.calcDuration,
            rmv: this.calcRmv,
        });
    }

    private setDefaultValues(): void {
        // rmv is calculated and duration is units independent
        if(this.units.imperialUnits) {
            this.calc.depth = this.units.toMeters(TankConstants.imperial3mDepth * 5);
            this.workingPressure = this.units.toBar(TankConstants.imperialTankWorkPressure);
            this.calc.tank = this.units.toTankLiters(TankConstants.imperialTankSize, this.workingPressure);
            this.calc.used = this.units.toBar(2200);
        } else {
            this.calc.depth = 15;
            // working pressure is irrelevant here
            this.calc.tank = 15;
            this.calc.used = 150;
        }
    }
}
