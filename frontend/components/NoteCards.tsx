"use client"
import { useEffect, useRef, useState } from "react"
import { Edit2, Trash2, Plus } from "lucide-react"

export interface Note {
  _id: string
  title: string
  content: string
}
type OPTIONS = "create" | "edit" | "delete"

export const NoteCards = () => {
    const [notes, setNotes] = useState<Note[]>([])
    const [currentNote, setCurrentNote] = useState<Note | null>(null)
    const [mode, setMode] = useState<OPTIONS | null>(null)
    const [input, setInput] = useState({ title: "", content: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const modalRef = useRef<HTMLDialogElement | null>(null)

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true)
            try {
                const response = await fetch("http://localhost:5000/")
                const data = await response.json()
                if(!response.ok){
                    throw new Error(data.message || "Failed to fetch notes");
                };
                setNotes(data.notes);
            }
            catch(err: unknown){
               if(err instanceof Error) setError(err.message)
               else setError("Failed to fetch notes")
            }
            finally{ 
               setLoading(false)
            }
        }
        fetchNotes()
    }, [])

    useEffect(() => {
        if(error){
            const timer = setTimeout(() => setError(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [error])

    const openModalHandler = (note?: Note, modalType: OPTIONS = "create") => {
        setMode(modalType)
        setCurrentNote(note || null)
        if(modalType === "edit"){
            setInput({ title: note!.title, content: note!.content })
        } 
        else if (modalType === "create") {
            setInput({ title: "", content: "" });
        }
        modalRef.current?.showModal()
    }

    const closeModalHandler = () => {
        setMode(null)
        setCurrentNote(null)
        setInput({ title: "", content: "" })
        modalRef.current?.close();
    }

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault()
        if(!input.title.trim() || !input.content.trim()){
            setError("Title / Content can't be empty")
            return;
        }
        try {
            if(mode === "edit" && currentNote){
                const response = await fetch(`http://localhost:5000/update/${currentNote._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(input),
                })
                const data = await response.json()
                if(!response.ok){
                    throw new Error(data.message || "Failed to update note")
                }
                setNotes(prev => 
                    prev.map(n => (n._id === currentNote._id ? data.note : n))
                )
                }   
                else if(mode === "create"){
                    const response = await fetch("http://localhost:5000/", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(input),
                    })
                    const data = await response.json()
                    if(!response.ok){
                        throw new Error(data.message || "Failed to create note")
                    }
                    setNotes(prev => [...prev, data.note])
                }
                closeModalHandler()
            } 
        catch(err: unknown){
               if(err instanceof Error) setError(err.message)
               else setError("Action failed")
            }
    }

    const deleteHandler = async () => {
        if(!currentNote) return
        try {
            const response = await fetch(`http://localhost:5000/delete/${currentNote._id}`, {
                method: "DELETE",
            })
            const data = await response.json()
            if(!response.ok){
                throw new Error(data.message ||"Failed to delete note")
            }
            setNotes(prev => 
                prev.filter(n => n._id !== currentNote._id)
            )
            closeModalHandler()
        } 
        catch(err: unknown){
               if(err instanceof Error) setError(err.message)
               else setError("Failed to delete note")
            }
    }

    const changeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setInput(prev => ({ 
            ...prev,
            [name]: value 
        }))
    }

    return (
        <div>
            <button onClick={() => openModalHandler(undefined, "create")} className="flex items-center gap-1 mb-4 px-4 py-2 bg-black text-white rounded hover:opacity-90">
                <Plus size={18} /> Create
            </button>
            {loading && <p>Loading...</p>}
            {mode == null && !loading && error && <p className="text-red-600">{error}</p>}
            <div className="grid gap-3 sm:gap-4">
                {!loading && notes && notes.length === 0 && <p>No notes exist...create one!</p>}
                {!loading && notes && notes.map(note => (
                    <div key={note._id} className="border border-black rounded-lg p-4 shadow-xl bg-white sm:p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-xl font-semibold truncate mb-2">{note.title}</h2>
                                <p className="text-md font-medium line-clamp-2 mb-3">{note.content}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button aria-label="edit" onClick={() => openModalHandler(note, "edit")} className="p-2 hover:bg-gray-400 rounded-lg transition-colors text-black">
                                    <Edit2 size={20} />
                                </button>
                                <button aria-label="delete" onClick={() => openModalHandler(note, "delete")} className="p-2 hover:bg-red-100 rounded-lg transition-colors text-foreground hover:text-red-500">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <dialog ref={modalRef} className="backdrop:bg-black/40 backdrop:backdrop-blur-sm p-0 border-none rounded-lg">
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg text-center">
                        {mode === "delete" && (
                            <>
                                <h2 className="text-lg font-semibold mb-4">Delete Note?</h2>
                                <p className="mb-4">This action cannot be undone.</p>
                                {!loading && error && <p className="text-red-600">{error}</p>}
                                <div className="flex justify-center gap-4">
                                    <button onClick={closeModalHandler} className="px-4 py-2 border rounded">
                                        Cancel
                                    </button>
                                    <button onClick={deleteHandler} className="px-4 py-2 bg-red-500 text-white rounded">
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                        {(mode === "create" || mode === "edit") && (
                          <form onSubmit={submitHandler} className="flex flex-col">
                                <h2 className="text-xl font-semibold mb-4 text-center">
                                    {mode === "create" ? "Create Note" : "Edit Note"}
                                </h2>
                                <input name="title" type="text" placeholder="Title" value={input.title} onChange={changeHandler} className="border border-gray-300 rounded-md w-full p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-black" />
                                <textarea name="content" placeholder="Content" value={input.content} onChange={changeHandler} className="border border-gray-300 rounded-md w-full p-2 mb-4 h-28 focus:outline-none focus:ring-2 focus:ring-black resize-none" />
                                {!loading && error && <p className="text-red-600">{error}</p>}
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={closeModalHandler} className="px-4 py-2 rounded-md border border-gray-400 hover:bg-gray-100">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-4 py-2 rounded-md bg-black text-white hover:opacity-90">
                                        {mode === "create" ? "Submit" : "Update"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </dialog>
        </div>
    )
}  
