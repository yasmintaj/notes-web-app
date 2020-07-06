import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { auditTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { NotesService } from './notes.service';

export interface Folder {
  id: number;
  name: string;
}

export interface Note {
  id: number;
  note: string;
  folder: number;
  updatedAt: Date;
  title: string;
  preview: string;
}
@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.sass'],
})
export class NotesComponent implements OnInit {
  @ViewChild('folderNameInput') folderNameInput: ElementRef;
  @ViewChild('folder') folder: ElementRef;
  @ViewChild('textFocus') textFocus: ElementRef;

  form = this.fb.group({
    auditTime: null,
  });
  autoSaveListener: Subscription;
  selectedNoteIndex = 0;
  selectedFolderId = 0;
  folders: [Folder] = [
    {
      id: 0,
      name: 'loading',
    },
  ];
  notes: [Note] = [
    {
      id: 0,
      note: 'Loading',
      folder: 0,
      updatedAt: new Date(),
      title: '',
      preview: '',
    },
  ];
  selectedNoteId: number;
  showFolderInput: boolean;
  showAddNote: boolean;
  selectedFolderName: string;
  notesToRemove: any;

  constructor(private notesService: NotesService, private fb: FormBuilder) {}

  async ngOnInit() {
    this.folders = await this.notesService.getFolders();
    this.folders = this.folders.sort((a, b) => a.name.localeCompare(b.name));
    if (this.folders.length) {
      this.switchFolder(this.folders[0].id);
      this.attachAutoSaveNoteListener();
    }
  }

  async switchFolder(folderId: number) {
    const notes = await this.notesService.getNotesByFolder(folderId);
    this.selectedFolderId = folderId;
    this.showAddNote = true;
    this.getFolderName();
    this.sortNotes(notes);
    this.switchNote();
  }

  sortNotes(notes: [Note]) {
    this.selectedNoteIndex = 0;
    this.notes = notes.sort((a, b) => {
      if (a.updatedAt < b.updatedAt) {
        return 1;
      }
      if (a.updatedAt > b.updatedAt) {
        return -1;
      }
      return 0;
    });
  }

  switchNote(noteId: number = null) {
    this.selectedNoteId = noteId;
    this.selectedNoteIndex =
      noteId === null ? 0 : this.notes.findIndex((n) => n.id === noteId);
    if (this.notes.length) {
      this.form
        .get('auditTime')
        .setValue(this.notes[this.selectedNoteIndex].note);
    }
  }

  attachAutoSaveNoteListener() {
    this.autoSaveListener = this.form
      .get('auditTime')
      .valueChanges.pipe(auditTime(1000))
      .subscribe((value) => {
        if (this.notes.length) {
          if (value === this.notes[this.selectedNoteIndex].note) {
            return;
          }
          this.notes[this.selectedNoteIndex].updatedAt = new Date();
          this.notes[this.selectedNoteIndex].note = value;
          const headings = value.split('\n', 2);
          if (headings.length) {
            this.notes[this.selectedNoteIndex].title = headings[0];
          }
          if (headings.length > 1) {
            this.notes[this.selectedNoteIndex].preview = headings[1];
          }
          this.notesService.updateNote(this.notes[this.selectedNoteIndex]);
          this.sortNotes(this.notes);
        }
      });
  }

  onBlurMethod() {
    this.addFolder();
    this.showFolderInput = false;
    this.showAddNote = true;
  }

  async addNote() {
    const note = await this.notesService.addNote({
      note: '',
      title: 'New Note',
      preview: 'No additional text',
      updatedAt: new Date(),
      id: new Date().getTime(),
      folder: this.selectedFolderId,
    });
    this.notes.unshift(note);
    try {
      this.textFocus.nativeElement.focus();
    } catch (e) {}
    this.switchNote(note.id);
  }

  async deleteNote() {
    await this.notesService.deleteNote(this.notes[this.selectedNoteIndex].id);
    this.notes.splice(this.selectedNoteIndex, 1);
    this.switchNote();
  }

  async deleteFolder() {
    await this.notesService.deleteFolder(this.selectedFolderId);
    this.folders = await this.notesService.getFolders();
    this.folders = this.folders.sort((a, b) => a.name.localeCompare(b.name));
    if (this.folders.length) {
      this.switchFolder(this.folders[0].id);
    } else {
      this.selectedFolderName = null;
    }
    if (this.notes.length) {
      for (let note of this.notes) {
        this.notes[this.selectedNoteIndex].id = note.id;
        this.deleteNote();
      }
    }
  }

  toggleNewFolderInput() {
    this.showFolderInput = !this.showFolderInput;
  }

  async addFolder() {
    if (!this.folders.length) {
      this.attachAutoSaveNoteListener();
    }
    if (this.folderNameInput.nativeElement.value) {
      const duplicateFolder = this.folders.filter(
        (folder) => folder.name === this.folderNameInput.nativeElement.value
      );
      if (duplicateFolder.length) {
        alert('Name Taken, Please choose a different name');
        this.showFolderInput = false;
      } else {
        const folder = await this.notesService.addFolder({
          name: this.folderNameInput.nativeElement.value,
          id: new Date().getTime(),
        });
        this.folders.push(folder);
        this.folders = this.folders.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        this.selectedFolderId = folder.id;
        this.showFolderInput = false;
        this.notes = [
          {
            id: 0,
            note: 'Loading',
            folder: 0,
            updatedAt: new Date(),
            title: '',
            preview: '',
          },
        ];
        this.getFolderName();
        this.showAddNote = true;
        this.addNote();
        this.notes.pop();
        // this.folderNameInput.nativeElement.value = "";
      }
    }
  }

  getFolderName() {
    const folders = this.folders.filter(
      (folder) => folder.id === this.selectedFolderId
    );
    this.selectedFolderName = folders[0].name;
  }
}
