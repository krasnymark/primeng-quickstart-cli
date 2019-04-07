import { Component, OnInit } from '@angular/core';
import { Car } from './domain/car';
import { CarService } from './services/carservice';
import { SelectItem } from 'primeng/components/common/selectitem';
import { MessageService } from 'primeng/components/common/messageservice';
import { DatePipe } from '@angular/common';

export class PrimeCar implements Car {
    constructor(public vin?, public year?, public brand?, public color?) {}
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [CarService]
})
export class AppComponent implements OnInit {

    displayDialog: boolean;
    car: Car = new PrimeCar();
    selectedCar: Car;
    newCar: boolean;
    cars1: Car[];
    cars2: Car[];
    cols: any[];
    brands: SelectItem[];
    clonedCars: { [s: string]: Car; } = {};

    constructor(private carService: CarService, private messageService: MessageService, private datePipe: DatePipe) { }

    ngOnInit() {
        this.carService.getCarsSmall().then(cars => this.cars1 = this.formatCars(cars));
        this.carService.getCarsSmall().then(cars => this.cars2 = this.formatCars(cars));

        this.cols = [
            { field: 'vin', header: 'Vin' },
            { field: 'year', header: 'Year' },
            { field: 'brand', header: 'Brand' },
            { field: 'color', header: 'Color' },
            { field: 'price', header: 'Price', type: 'number' },
            { field: 'saleDate', header: 'Sale Date', type: 'date' }
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
    }

    formatCars(cars: Car[]): Car[] {
        cars.forEach(car => car.saleDate = new Date(car.saleDate));
        return cars;
    }
    getCellValue(data: any[], field: string): any {
        const fieldValue: any = data[field];
        return this.isDate(fieldValue) ? this.datePipe.transform(fieldValue) : fieldValue;
    }
    isDate(date: any): boolean {
        return date instanceof Date && !isNaN(date.valueOf());
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
        this.newCar = false;
        this.car = {...event.data};
        this.displayDialog = true;
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
