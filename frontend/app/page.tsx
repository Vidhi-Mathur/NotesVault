import { NoteCards } from "@/components/NoteCards";

export default function Home() {
    return (
        <main className="mt-32 ml-4 mr-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-black underline">My Notes</h1>
            </div>
            <NoteCards />
        </main>
    );
}