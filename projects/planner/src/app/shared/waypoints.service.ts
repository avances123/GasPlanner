import { Injectable } from '@angular/core';
import { UnitConversion } from './UnitConversion';
import { WayPoint } from './models';
import { Segment } from 'scuba-physics';

@Injectable()
export class WayPointsService {
    constructor(private units: UnitConversion){}

    public calculateWayPoints(profile: Segment[]): WayPoint[] {
        const wayPoints = [];

        if(profile.length === 0) {
            return [];
        }

        const descent = profile[0];
        let lastWayPoint = WayPoint.fromSegment(this.units, descent);
        let lastSegment = descent;
        wayPoints.push(lastWayPoint);
        const exceptDescend = profile.slice(1);

        exceptDescend.forEach((segment) => {
            const waypoint = this.toWayPoint(segment, lastWayPoint, lastSegment);
            lastWayPoint = waypoint;
            lastSegment = segment;
            wayPoints.push(waypoint);
        });

        return wayPoints;
    }

    private toWayPoint(segment: Segment, lastWayPoint: WayPoint, lastSegment: Segment): WayPoint {
        const waypoint = lastWayPoint.toLevel(segment);
        const hasSwitch = !segment.gas.compositionEquals(lastSegment.gas);

        if (hasSwitch) {
            waypoint.asGasSwitch();
        }

        return waypoint;
    }
}

