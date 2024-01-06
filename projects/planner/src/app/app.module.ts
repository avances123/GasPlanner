import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {ServiceWorkerModule} from '@angular/service-worker';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {DatePipe, DecimalPipe} from '@angular/common';

import {ClipboardModule} from 'ngx-clipboard';
import {MdbCollapseModule} from 'mdb-angular-ui-kit/collapse';
import {MdbDropdownModule} from 'mdb-angular-ui-kit/dropdown';
import {MdbFormsModule} from 'mdb-angular-ui-kit/forms';
import {MdbTabsModule} from 'mdb-angular-ui-kit/tabs';
import {MdbAccordionModule} from 'mdb-angular-ui-kit/accordion';

import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TanksSimpleComponent} from './tanks-simple/tanks-simple.component';
import {TanksComplexComponent} from './tanks-complex/tanks-complex.component';
import {DiverComponent} from './diver/diver.component';
import {DiveOptionsComponent} from './diveoptions/diveoptions.component';
import {DiveInfoComponent} from './diveinfo/diveinfo.component';
import {MainMenuComponent} from './mainmenu/mainmenu.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {GaslabelComponent} from './gaslabel/gaslabel.component';
import {SacComponent} from './sac/sac.component';
import {NitroxComponent} from './nitrox/nitrox.component';
import {WayPointsComponent} from './waypoints/waypoints.component';
import {ProfileChartComponent} from './profilechart/profilechart.component';
import {AboutComponent} from './about/about.component';
import {AppFooterComponent} from './footer/footer.component';
import {DepthsSimpleComponent} from './depths-simple/depths-simple.component';
import {DepthsComplexComponent} from './depths-complex/depths-complex.component';
import {TankChartComponent} from './tank-chart/tank-chart.component';
import {AppSettingsComponent} from './app-settings/app-settings.component';
import {CalculatingComponent} from './calculating/calculating.component';
import {NdlLimitsComponent} from './ndl-limits/ndl-limits.component';
import {SalinityComponent} from './salinity/salinity.component';
import {AltitudeComponent} from './altitude/altitude.component';
import {GradientsComponent} from './gradients/gradients.component';
import {DepthComponent} from './depth/depth.component';
import {OxygenComponent} from './oxygen/oxygen.component';

import {DurationPipe} from './pipes/duration.pipe';
import {PlannerService} from './shared/planner.service';
import {PreferencesStore} from './shared/preferencesStore';
import {UnitConversion} from './shared/UnitConversion';
import {SelectedWaypoint} from './shared/selectedwaypointService';
import {WorkersFactory} from './shared/workers.factory';
import {WorkersFactoryCommon} from './shared/serial.workers.factory';
import {NdlService} from './shared/ndl.service';
import {OptionsService} from './shared/options.service';
import {PpO2Component} from './pp-o2/pp-o2.component';
import {DelayedScheduleService} from './shared/delayedSchedule.service';
import {AppinfoComponent} from './appinfo/appinfo.component';
import {DiveIssuesComponent} from './dive-issues/dive-issues.component';
import {InputControls} from './shared/inputcontrols';
import {ValidatorGroups} from './shared/ValidatorGroups';
import {DepthsService} from './shared/depths.service';
import {TanksService} from './shared/tanks.service';
import {SacCalculatorService} from './shared/sac-calculator.service';
import {NitroxCalculatorService} from './shared/nitrox-calculator.service';
import {SettingsNormalizationService} from './shared/settings-normalization.service';
import {ViewSwitchService} from './shared/viewSwitchService';
import {OxygenDropDownComponent} from './oxygen-dropdown/oxygen-dropdown.component';
import {Preferences} from './shared/preferences';
import {PlanUrlSerialization} from './shared/PlanUrlSerialization';
import {WayPointsService} from './shared/waypoints.service';
import {PlanTabsComponent} from './plan.tabs/plan.tabs.component';
import {TankSizeComponent} from './tank.size/tank.size.component';
import {StopsFilter} from './shared/stopsFilter.service';
import {ViewStates} from './shared/viewStates';
import {Urls} from './shared/navigation.service';
import {SubViewStorage} from './shared/subViewStorage';
import {DashboardStartUp} from './shared/startUp';
import {AltitudeCalcComponent} from './altitude-calc/altitude-calc.component';
import {WeightCalcComponent} from './weight/weight.component';
import {GasPropertiesCalcComponent} from './gas.props/gas.props.component';
import {DiffComponent} from './diff/diff.component';
import {DiveResults} from './shared/diveresults';
import {DiveSchedules} from './shared/dive.schedules';
import {RedundanciesComponent} from './redundancies/redundancies.component';
import {RedundanciesService} from './shared/redundancies.service';
import {ReloadDispatcher} from './shared/reloadDispatcher';
import {ManagedDiveSchedules} from './shared/managedDiveSchedules';
import {WaypointsDifferenceComponent} from './diff/waypoints/diff-waypoints.component';
import {DiveInfoDifferenceComponent} from './diff/diveinfo/diff-diveinfo.component';
import {ProfileDifferenceChartComponent} from './diff/profilechart/diff-profilechart.component';
import {MaskitoModule} from '@maskito/angular';
import {SurfaceIntervalComponent} from './surface-interval/surface-interval.component';
import {TestDataInjector} from './diff/testData/testDataInjector';

const ANGULAR_MODULES = [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FontAwesomeModule,
    ReactiveFormsModule
];

const MDB_MODULES = [
    MdbCollapseModule,
    MdbDropdownModule,
    MdbFormsModule,
    MdbTabsModule,
    MdbAccordionModule
];

const COMPONENTS = [
    AboutComponent,
    AppFooterComponent,
    AltitudeCalcComponent,
    AltitudeComponent,
    AppComponent,
    AppinfoComponent,
    AppSettingsComponent,
    CalculatingComponent,
    DashboardComponent,
    DepthComponent,
    DepthsComplexComponent,
    DepthsSimpleComponent,
    DiffComponent,
    DiveInfoComponent,
    DiveIssuesComponent,
    DiveOptionsComponent,
    DiverComponent,
    DurationPipe,
    GaslabelComponent,
    GasPropertiesCalcComponent,
    GradientsComponent,
    MainMenuComponent,
    NdlLimitsComponent,
    NitroxComponent,
    ProfileChartComponent,
    OxygenComponent,
    OxygenDropDownComponent,
    PpO2Component,
    PlanTabsComponent,
    RedundanciesComponent,
    SacComponent,
    SalinityComponent,
    SurfaceIntervalComponent,
    TankChartComponent,
    TanksComplexComponent,
    TanksSimpleComponent,
    TankSizeComponent,
    WayPointsComponent,
    WeightCalcComponent,
    WaypointsDifferenceComponent,
    DiveInfoDifferenceComponent,
    ProfileDifferenceChartComponent
];

const SERVICES = [
    { provide: WorkersFactoryCommon, useClass: WorkersFactory },
    DatePipe,
    DecimalPipe,
    DashboardStartUp,
    DelayedScheduleService,
    DepthsService,
    DiveResults,
    DiveSchedules,
    InputControls,
    ManagedDiveSchedules,
    NdlService,
    NitroxCalculatorService,
    OptionsService,
    PlanUrlSerialization,
    PlannerService,
    Preferences,
    PreferencesStore,
    ReloadDispatcher,
    RedundanciesService,
    SacCalculatorService,
    SelectedWaypoint,
    SettingsNormalizationService,
    StopsFilter,
    SubViewStorage,
    TanksService,
    UnitConversion,
    Urls,
    ValidatorGroups,
    ViewStates,
    ViewSwitchService,
    WayPointsService,
    TestDataInjector
];

@NgModule({
    declarations: COMPONENTS,
    imports: [
        ...ANGULAR_MODULES,
        ...MDB_MODULES,
        ClipboardModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the application is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        }),
        MaskitoModule
    ],
    exports: [],
    providers: SERVICES,
    bootstrap: [AppComponent]
})
export class AppModule { }
