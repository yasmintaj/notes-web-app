import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Folder, Note } from './notes.component';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private apiURL = 'https://notes-json-demo.herokuapp.com';

  constructor(private _http: HttpClient) {}

  getFolders(): Promise<[Folder]> {
    return this._http.get<[Folder]>(`${this.apiURL}/folders`).toPromise();
  }

  addFolder(folder): Promise<Folder> {
    return this._http
      .post<Folder>(`${this.apiURL}/folders`, folder, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .toPromise();
  }

  getNotesByFolder(folderId: Number): Promise<[Note]> {
    return new Promise((resolve) => {
      this._http
        .get<[Note]>(`${this.apiURL}/notes?folder=${folderId}`)
        .toPromise()
        .then((res) => {
          res.forEach((i) => (i.updatedAt = new Date(i.updatedAt)));
          resolve(res);
        });
    });
  }

  addNote(note: Note): Promise<Note> {
    return new Promise((resolve) => {
      this._http
        .post<Note>(`${this.apiURL}/notes`, note, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .toPromise()
        .then((i) => {
          i.updatedAt = new Date(i.updatedAt);
          resolve(i);
        });
    });
  }

  updateNote(note: Note) {
    return new Promise((resolve) => {
      this._http
        .put<Note>(`${this.apiURL}/notes/${note.id}`, note, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .toPromise()
        .then((i) => {
          i.updatedAt = new Date(i.updatedAt);
          resolve(i);
        });
    });
  }

  deleteNote(noteId: number) {
    return this._http.delete(`${this.apiURL}/notes/${noteId}`).toPromise();
  }

  deleteFolder(folderId: number) {
    return this._http.delete(`${this.apiURL}/folders/${folderId}`).toPromise();
  }
}
