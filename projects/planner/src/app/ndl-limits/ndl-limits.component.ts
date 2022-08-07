import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { faTable, faCog } from '@fortawesome/free-solid-svg-icons';
import { Options, Tank, Time } from 'scuba-physics';
import { NdlLimit, NdlService } from '../shared/ndl.service';
import { UnitConversion } from '../shared/UnitConversion';
import { TankBound } from '../tanks/tanks.component';


@Component({
    selector: 'app-ndl-limits',
    templateUrl: './ndl-limits.component.html',
    styleUrls: ['./ndl-limits.component.css']
})
export class NdlLimitsComponent {
    public icon = faTable;
    public iconConfig = faCog;
    public tank: TankBound;
    public options = new Options();
    public totalDuration = Time.oneDay;
    public isComplex = false;
    public calculating = false;
    public limits: NdlLimit[] = [];

    constructor(private router: Router, public units: UnitConversion, private ndl: NdlService) {
        this.tank = new TankBound(new Tank(15, 200, 21), this.units);
    }

    public calculate(): void {
        this.limits = this.ndl.calculate(this.tank.tank.gas, this.options);
    }

    // TODO Nitrox component uses planner to get its values to label, the same applies to tank

    public goBack(): void {
    // public async goBack(): Promise<boolean> {
        // TODO return await this.router.navigateByUrl('/');
        this.calculate();
    }
}
