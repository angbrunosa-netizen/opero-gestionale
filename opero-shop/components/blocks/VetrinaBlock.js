export default function VetrinaBlock({ config }) {
    return (
        <div className="py-12" style={{ backgroundColor: 'var(--block-background-color)' }}>
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-8">{config?.titolo || "I Nostri Prodotti"}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                            <div className="h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-400">Immagine Prodotto</div>
                            <h3 className="font-bold">Prodotto Esempio {i}</h3>
                            <p className="text-blue-600 font-semibold mt-2">€ 99,00</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}