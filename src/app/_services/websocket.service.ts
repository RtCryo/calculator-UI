import { Injectable } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { ExpressionDTO } from '../_models/expressionDTO';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public expressions!: ExpressionDTO[];
  private stompClient!: Stomp.Client;

  constructor(private http: HttpClient) {
    this.refreshList();
    this.connect();
  }

  setExpression(expression: ExpressionDTO){
    this.expressions.push(expression);
  }

  refreshList(){
    this.getAll().subscribe(expressions => {
      this.expressions = expressions;
    });
  }

  deleteExpression(expression: ExpressionDTO) {
    let index = this.expressions.indexOf(expression);
    delete this.expressions[index];
  }

  connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    if(socket) {
      this.stompClient = Stomp.over(socket);
    }
    const _this = this;
    this.stompClient.connect({}, function () {
      _this.stompClient.subscribe('/topic/public', (msg) => {
          if(msg.body){
            let expressionMessage = JSON.parse(msg.body);
            if(expressionMessage.type === "ADD") {
              _this.setExpression(expressionMessage.expression);
            }
            if(expressionMessage.type === "REFRESH") {
              _this.refreshList();
            }
            if(expressionMessage.type === "DELETE") {
              _this.refreshList();
            }
          }
      });
    });
  }

  getAll() {
    return this.http.get<ExpressionDTO[]>(`${environment.hostUrl}/admin`, {withCredentials: true});
  }
}
