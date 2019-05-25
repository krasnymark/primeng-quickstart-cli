import { Component, OnInit, ViewChild } from '@angular/core';
import { Car } from './domain/car';
import { CarService } from './services/carservice';
import { SelectItem } from 'primeng/components/common/selectitem';
import { MessageService } from 'primeng/components/common/messageservice';
import { DatePipe } from '@angular/common';
import { MenuItem } from 'primeng/components/common/menuitem';
import { Table } from 'primeng/table';

export class PrimeCar implements Car {
    constructor(public vin?: string, public year?: number, public brand?: string, public color?: string) {}
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [CarService]
})
export class AppComponent implements OnInit {
    static _datePipe: DatePipe;
    @ViewChild(Table) dt: Table;
    displayDialog: boolean;
    car: Car = new PrimeCar();
    selectedCar: Car;
    newCar: boolean;
    cars1: Car[];
    cars2: Car[];
    cols: any[];
    brands: SelectItem[];
    clonedCars: { [s: string]: Car; } = {};
    menuItems: MenuItem[];

    constructor(private carService: CarService, private messageService: MessageService, private datePipe: DatePipe) {
        AppComponent._datePipe = datePipe;
    }
    static isDate(date: any): boolean {
        return date instanceof Date && !isNaN(date.valueOf());
    }
    static cellValue(data: any): any {
        return AppComponent.isDate(data) ? AppComponent._datePipe.transform(data, 'yyyy-MM-dd') : data;
    }

    ngOnInit() {
        this.carService.getCarsSmall().then(cars => this.cars1 = this.formatCars(cars));
        this.carService.getCarsSmall().then(cars => this.cars2 = this.formatCars(cars));

        this.cols = [
            { field: 'vin', header: 'Vin' },
            { field: 'year', header: 'Year' },
            { field: 'brand', header: 'Brand' },
            { field: 'color', header: 'Color' },
            { field: 'price', header: 'Price' },
            { field: 'saleDate', header: 'Sale Date' }
        ];

        this.brands = [
            {label: 'Audi', value: 'Audi'},
            {label: 'BMW', value: 'BMW'},
            {label: 'Fiat', value: 'Fiat'},
            {label: 'Ford', value: 'Ford'},
            {label: 'Honda', value: 'Honda'},
            {label: 'Jaguar', value: 'Jaguar'},
            {label: 'Mercedes', value: 'Mercedes'},
            {label: 'Renault', value: 'Renault'},
            {label: 'VW', value: 'VW'},
            {label: 'Volvo', value: 'Volvo'}
        ];

        this.menuItems = [
            { label: 'View', icon: 'pi pi-search', command: (event) => this.viewCar(this.selectedCar) },
            { label: 'Edit', icon: 'pi pi-pencil', command: (event) => this.editCar(this.selectedCar) },
            { label: 'Export', icon: 'pi pi-file', command: (event) => this.dt.exportCSV() },
        ];
        this.dt.exportFunction = this.exportFunction;
    }

    viewCar(car: Car) {
        this.messageService.add({ severity: 'info', summary: 'Car Selected', detail: car.vin + ' - ' + car.brand });
    }

    editCar(car: Car) {
        this.newCar = false;
        this.car = car;
        this.displayDialog = true;
    }

    formatCars(cars: Car[]): Car[] {
        let days = 0;
        cars.forEach(car => {
            car.saleDate = new Date(car.saleDate);
            car.saleDate.setDate(car.saleDate.getDate() + days);
            days += 30;
        });
        return cars;
    }
    getCellValue(data: any[], field: string): any {
        return AppComponent.cellValue(data[field]);
    }
    exportFunction(cellData: any): any {
        // const value = cellData.data;
        // const field = cellData.field
        return AppComponent.cellValue(cellData.data);
    }
    showDialogToAdd() {
        this.newCar = true;
        this.car = new PrimeCar();
        this.displayDialog = true;
    }

    save() {
        const cars = [...this.cars1];
        if (this.newCar) {
            cars.push(this.car);
        } else {
            cars[this.findSelectedCarIndex()] = this.car;
        }
        this.cars1 = cars;
        this.car = null;
        this.displayDialog = false;
    }

    delete() {
        const index = this.findSelectedCarIndex();
        this.cars1 = this.cars1.filter((val, i) => i !== index);
        this.car = null;
        this.displayDialog = false;
    }

    onRowSelect(event) {
        this.editCar({...event.data});
    }

    findSelectedCarIndex(): number {
        return this.cars1.indexOf(this.selectedCar);
    }

    onRowEditInit(car: Car) {
        this.clonedCars[car.vin] = {...car};
    }

    onRowEditSave(car: Car) {
        if (car.year > 0) {
            delete this.clonedCars[car.vin];
            this.messageService.add({severity: 'success', summary: 'Success', detail: 'Car is updated'});
        } else {
            this.messageService.add({severity: 'error', summary: 'Error', detail: 'Year is required'});
        }
    }

    onRowEditCancel(car: Car, index: number) {
        this.cars2[index] = this.clonedCars[car.vin];
        delete this.clonedCars[car.vin];
    }
}
