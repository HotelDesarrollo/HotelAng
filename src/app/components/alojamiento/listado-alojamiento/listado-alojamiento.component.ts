import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';

import { AlojamientoService } from '../../../services/alojamiento.service';
import { Alojamiento } from '../../../Models/alojamiento.model';
import { FormularioAlojamientoComponent } from '../formulario-alojamiento/formulario-alojamiento.component';

import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-listado-alojamiento',
  templateUrl: './listado-alojamiento.component.html',
  styleUrls: ['./listado-alojamiento.component.scss'],
})
export class ListadoAlojamientoComponent implements OnInit, OnDestroy {
  public alojamientos: Alojamiento[] = [];
  refAloj: Observable<any>;
  subs: Subscription[] = [];
  public isLoaded = false;
  private promesa: Promise<any>;
  public dataSource: Alojamiento[] = [];
  displayedColumns: string[] = [
    'id',
    'nombre',
    'descripcion',
    'tiempo_estadia',
    'actions',
  ];
  success = false;

  constructor(
    private _alojamientoService: AlojamientoService,
    private dialog: MatDialog,
    private SpinnerService: NgxSpinnerService
  ) {
    this.promesa = new Promise<void>((resolve) => {
      const sub = this._alojamientoService.ObtenerAlojamientos().subscribe(
        // (res) => this.alojamientos.push(res),
        // (error) => console.log('Hubo un fallo al momento de traer los datos'),
        // () => resolve()

        {
          next: (res) => {
            this.alojamientos.push(res);
          },
          error: (error: any) => {
            console.log(error),
              console.log('Hubo un fallo al momento de traer los datos');
            () => resolve();
          },
        }
      );
      this.subs.push(sub);
      this.dataSource = this.alojamientos;
      console.log('Yo traigo los datos y son estos:', this.dataSource);
      // console.log('Los datos son:', this.dataSource);
    });

    this.refAloj = this._alojamientoService.getList();
  }

  ngOnInit(): void {
    this.SpinnerService.show();
    this.promesa.then(() => {
      this.isLoaded = true;
      // this._alojamientoService.successObten();
      this.subs.push();
    });
    this.CloseDialog();
    this.refAloj.subscribe((data) => {
      this.alojamientos = data;
      // console.log('Hola', data);
      this.dataSource = [];
      this.alojamientos.forEach((element) => {
        this.dataSource.push(element);
      });

      this.CloseDialog();
    });
  }

  ngOnDestroy(): void {
    this._alojamientoService.list = [];
    this.subs.map((sub) => sub.unsubscribe());
  }

  eliminarAlojamiento(id: number): any {
    Swal.fire({
      title: '??Esta seguro de eliminar este dato?',
      text: '??No se podra recuperar este dato luego de ser eliminado!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.value) {
        this.SpinnerService.show();
        this._alojamientoService.BorrarAlojamiento(id).subscribe((data) => {
          this.success = true;
          Swal.fire('Eliminado!', 'El dato ha sido eliminado.', 'success');
          this.SpinnerService.hide();
          console.log('Se elimino el alojamiento');
          // se debe mandar a llamar al servicio para que se actualice la lista de datos para obtener los datos registrados
          console.log(data);
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        (error: string) =>
          console.log('Hubo un fallo al momento de eliminar el dato' + error);
        Swal.fire(
          'Cancelado',
          'El dato no fue eliminado y esta seguro :)',
          'error'
        );
      }
    });
  }

  CloseDialog(): void {
    this.SpinnerService.hide();
  }

  openDialog(tipo: string, id?: number): void {
    if (tipo === 'c') {
      this.dialog.open(FormularioAlojamientoComponent, {
        data: { type: tipo },
      });
    } else {
      const alojam = this.alojamientos.find((d) => d.id === id);
      this.dialog.open(FormularioAlojamientoComponent, {
        // width: '70%',
        data: { type: tipo, alojam },
      });
    }
  }
}
