import { Injectable } from "@angular/core";
import { ToastrService } from 'ngx-toastr'

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    constructor (private toastr: ToastrService) {}

    sucesso(mensagem: string, titulo: string = 'Sucesso'): void {
        this.toastr.success(mensagem, titulo);
    }

    erro(mensagem: string, titulo: string = 'Erro'): void {
        this.toastr.error(mensagem, titulo);
    }

    alerta(mensagem: string, titulo: string = 'Atenção'): void {
        this.toastr.warning(mensagem, titulo);
    }

    info(mensagem: string, titulo: string = 'Informação'): void {
        this.toastr.info(mensagem, titulo);
    }
}