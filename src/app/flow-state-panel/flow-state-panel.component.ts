import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FlowStateService } from '../services/flow-state.service';
import { State } from '../models/state.interface'; // Import the State interface

@Component({
  selector: 'app-flow-state-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './flow-state-panel.component.html',
  styleUrls: ['./flow-state-panel.component.css'],
})
export class FlowStatePanelComponent implements OnInit {
  flowName: string = '';
  stateName: string = '';
  flows: any[] = [];
  states: State[] = []; // Use the State interface for typing
  selectedFlowId: number | null = null;
  selectedStateId: string | null = null; // Keep this as string since ngModel binds to strings for select
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private flowStateService: FlowStateService) {}

  ngOnInit(): void {
    this.getFlows();
  }

  createFlow() {
    if (this.flowName) {
      this.flowStateService.createFlow(this.flowName).subscribe(
        () => {
          this.getFlows();
          this.message = `FLOW ${this.flowName} is created`;
          this.messageType = 'success';
          this.flowName = '';
        },
        (error: any) => {
          this.message = `It is not possible to duplicate the same FLOW ${this.flowName}`;
          this.messageType = 'error';
        }
      );
    }
  }

  createState() {
    if (this.stateName && this.selectedFlowId !== null) {
      this.flowStateService
        .createState(this.stateName, this.selectedFlowId)
        .subscribe(
          () => {
            this.getStates();
            this.message = `State ${this.stateName} is created`;
            this.messageType = 'success';
            this.stateName = '';
          },
          (error: any) => {
            this.message = `It is not possible to duplicate the same State ${this.stateName}`;
            this.messageType = 'error';
          }
        );
    }
  }

  getFlows() {
    this.flowStateService.getAllFlows().subscribe(
      (data) => {
        console.log('Flows:', data);
        this.flows = data;
        if (this.flows.length > 0) {
          this.selectedFlowId = this.flows[0].id; // Ensure selectedFlowId is a number
          this.getStates();
        }
      },
      (error: any) => {
        console.error('Error fetching flows:', error);
      }
    );
  }

  getStates() {
    if (this.selectedFlowId !== null) {
      this.flowStateService.getAllStatesByFlowId(this.selectedFlowId).subscribe(
        (data: State[]) => {
          console.log('States:', data);
          this.states = data.map((state: State) => ({
            ...state,
            associated: state.flow.id === this.selectedFlowId,
          }));
          if (this.states.length > 0) {
            this.selectedStateId = this.states[0].id.toString();
          }
        },
        (error: any) => {
          console.error('Error fetching states:', error);
        }
      );
    }
  }

  deleteStateAssociation() {
    if (this.selectedStateId !== null && this.selectedFlowId !== null) {
      console.log('Selected Flow ID:', this.selectedFlowId);
      console.log('Selected State ID:', this.selectedStateId);

      console.log('Flows:', this.flows);
      console.log('States:', this.states);

      this.flows.forEach((flow) => {
        console.log(
          `Flow ID: ${flow.id} (${typeof flow.id}), Selected Flow ID: ${
            this.selectedFlowId
          } (${typeof this.selectedFlowId})`
        );
      });

      this.states.forEach((state) => {
        console.log(
          `State ID: ${state.id} (${typeof state.id}), Selected State ID: ${
            this.selectedStateId
          } (${typeof this.selectedStateId})`
        );
      });

      const selectedFlow = this.flows.find(
        (flow) => flow.id === Number(this.selectedFlowId) // Convert selectedFlowId to number
      );

      const selectedState = this.states.find(
        (state) => state.id === Number(this.selectedStateId) // Convert selectedStateId to number
      );

      console.log('Selected Flow:', selectedFlow);
      console.log('Selected State:', selectedState);

      if (selectedFlow && selectedState) {
        console.log(
          `Deleting state association ${selectedState.name} with ${selectedFlow.name}...`
        );
        const currentTime = new Date().toISOString(); // Get the current time in ISO format

        this.flowStateService
          .deleteState(
            Number(this.selectedStateId),
            Number(this.selectedFlowId)
          )
          .subscribe(
            () => {
              this.getStates();
              this.message = `The state association ${selectedState.name} with ${selectedFlow.name} is deleted.`;
              this.messageType = 'success';
              this.selectedStateId = null;
              console.log(
                `State association ${selectedState.name} with ${selectedFlow.name} deleted at ${currentTime}`
              );
            },
            (error: any) => {
              this.message = `Failed to delete the state`;
              this.messageType = 'error';
            }
          );
      } else {
        console.error('Selected flow or state is not found');
      }
    }
  }
}
