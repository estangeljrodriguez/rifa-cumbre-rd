import React, { useState } from 'react';
import { Edit2, Trash2, CheckCircle, Shuffle } from 'lucide-react';

export default function App() {
  const [boletas, setBoletas] = useState(1);
  const [selectedNums, setSelectedNums] = useState<string[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastBuyer, setLastBuyer] = useState<any>(null);

  // Formulario
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalNumbersRequired = boletas * 3;
  const missingNumbers = totalNumbersRequired - selectedNums.length;
  const totalPrice = boletas * 10000;

  // Generar todos los números del 000 al 999
  const allNumbers = Array.from({ length: 1000 }, (_, i) =>
    i.toString().padStart(3, '0')
  );

  const getStatus = (num: string) => {
    if (selectedNums.includes(num)) return 'selected';
    if (buyers.some((b) => b.numbers.includes(num))) return 'sold';
    return 'available';
  };

  const handleSelect = (num: string) => {
    const status = getStatus(num);
    if (status === 'sold') return;

    if (status === 'selected') {
      setSelectedNums(selectedNums.filter((n) => n !== num));
    } else {
      if (selectedNums.length < totalNumbersRequired) {
        setSelectedNums([...selectedNums, num].sort());
      } else {
        alert(
          `Ya elegiste tus ${totalNumbersRequired} números. Aumenta las boletas si quieres más.`
        );
      }
    }
  };

  const fillRandom = () => {
    if (missingNumbers <= 0) return;
    const available = allNumbers.filter((n) => getStatus(n) === 'available');
    if (available.length < missingNumbers) {
      alert('No hay suficientes números libres.');
      return;
    }

    const shuffled = available.sort(() => 0.5 - Math.random());
    const newPicks = shuffled.slice(0, missingNumbers);
    setSelectedNums([...selectedNums, ...newPicks].sort());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNums.length < totalNumbersRequired) {
      alert(`Te faltan ${missingNumbers} números por elegir.`);
      return;
    }

    const receiptId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const dateStr = new Date().toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const newBuyer = {
      id: editingId || receiptId,
      name: formName,
      phone: formPhone,
      vendor: formVendor,
      numbers: selectedNums,
      boletas,
      totalPrice,
      dateStr,
      receiptId,
    };

    if (editingId) {
      setBuyers(buyers.map((b) => (b.id === editingId ? newBuyer : b)));
      setEditingId(null);
    } else {
      setBuyers([...buyers, newBuyer]);
    }

    setLastBuyer(newBuyer);
    setShowSuccess(true);

    // Limpiar formulario
    setSelectedNums([]);
    setFormName('');
    setFormPhone('');
    setBoletas(1);
  };

  const sendWhatsApp = (buyer: any) => {
    const text = `🎟️ *Comprobante – APOYO ECONOMICO CUMBRE RD*\n\nHola ${
      buyer.name
    }, gracias por tu compra.\n\nTus números: *${buyer.numbers.join(
      ' · '
    )}*\nValor: $${buyer.totalPrice.toLocaleString(
      'es-CO'
    )}\nPremio: 500000\nSorteo: 23 noviembre lotería Cundinamarca\n\nComprobante N° ${
      buyer.receiptId
    } · ${buyer.dateStr}\n¡Mucha suerte! 🍀`;

    const phoneCode = buyer.phone.startsWith('57')
      ? buyer.phone
      : `57${buyer.phone}`;
    const url = `https://wa.me/${phoneCode}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShowSuccess(false);
  };

  const deleteBuyer = (id: string) => {
    if (
      window.confirm(
        '¿Seguro que deseas eliminar esta compra y liberar los números?'
      )
    ) {
      setBuyers(buyers.filter((b) => b.id !== id));
    }
  };

  const editBuyer = (b: any) => {
    setFormName(b.name);
    setFormPhone(b.phone);
    setFormVendor(b.vendor);
    setBoletas(b.boletas);
    setSelectedNums(b.numbers);
    setEditingId(b.id);
    setShowSuccess(false);
  };

  if (showSuccess && lastBuyer) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
        <h2 className="text-3xl font-bold mb-2">¡Compra Guardada!</h2>
        <p className="text-zinc-400 mb-8">
          Los números de {lastBuyer.name} han sido reservados.
        </p>

        <button
          onClick={() => sendWhatsApp(lastBuyer)}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-full mb-4 w-full max-w-md text-lg transition-colors"
        >
          Enviar Comprobante por WhatsApp
        </button>
        <button
          onClick={() => setShowSuccess(false)}
          className="text-zinc-400 hover:text-white py-2"
        >
          Volver a la Rifa
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-32">
      {/* Header y Estadísticas */}
      <header className="p-4 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
        <h1 className="text-xl font-bold text-center mb-4">Rifa Cumbre RD</h1>
        <div className="flex justify-between text-sm text-zinc-400 mb-4 px-2">
          <div className="text-center">
            <span className="block text-xl font-bold text-white">
              {buyers.length}
            </span>
            Boletas Vendidas
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold text-green-400">
              $
              {buyers
                .reduce((acc, b) => acc + b.totalPrice, 0)
                .toLocaleString('es-CO')}
            </span>
            Recaudado
          </div>
        </div>

        {/* Pestañas de centenas */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {Array.from({ length: 10 }).map((_, i) => {
            const start = i * 100;
            const end = start + 99;
            const label = `${start.toString().padStart(3, '0')}-${end
              .toString()
              .padStart(3, '0')}`;
            const libres =
              100 -
              allNumbers
                .slice(start, end + 1)
                .filter((n) => getStatus(n) === 'sold').length;

            return (
              <button
                key={i}
                onClick={() => setCurrentTab(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm transition-colors ${
                  currentTab === i
                    ? 'bg-zinc-100 text-black font-bold'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <div>{label}</div>
                <div className="text-xs opacity-70">{libres} libres</div>
              </button>
            );
          })}
        </div>
      </header>

      {/* Cuadrícula 10x10 */}
      <div className="p-2 max-w-2xl mx-auto">
        <div className="grid grid-cols-10 gap-1">
          {allNumbers
            .slice(currentTab * 100, (currentTab + 1) * 100)
            .map((num) => {
              const status = getStatus(num);
              return (
                <button
                  key={num}
                  onClick={() => handleSelect(num)}
                  disabled={status === 'sold'}
                  className={`
                  aspect-square rounded text-[10px] sm:text-xs flex items-center justify-center font-mono border transition-all
                  ${
                    status === 'available'
                      ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      : ''
                  }
                  ${
                    status === 'selected'
                      ? 'bg-emerald-500 border-emerald-400 text-black font-bold'
                      : ''
                  }
                  ${
                    status === 'sold'
                      ? 'bg-zinc-900 border-zinc-900 text-zinc-700 opacity-50'
                      : ''
                  }
                `}
                >
                  {num}
                </button>
              );
            })}
        </div>
      </div>

      {/* Panel inferior fijo de compra */}
      <div className="fixed bottom-0 w-full bg-zinc-900 border-t border-zinc-800 p-4 rounded-t-2xl z-20">
        <form onSubmit={handleSave} className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-lg">
            <span className="text-sm text-zinc-400">Cantidad de Boletas:</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setBoletas(Math.max(1, boletas - 1))}
                className="w-8 h-8 bg-zinc-800 rounded-full font-bold"
              >
                -
              </button>
              <span className="font-bold">{boletas}</span>
              <button
                type="button"
                onClick={() => setBoletas(boletas + 1)}
                className="w-8 h-8 bg-zinc-800 rounded-full font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillRandom}
              disabled={missingNumbers <= 0}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                missingNumbers > 0
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                  : 'bg-zinc-950 text-zinc-600'
              }`}
            >
              <Shuffle size={16} />
              {missingNumbers > 0
                ? `Elegir ${missingNumbers} al azar`
                : 'Números completos'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              required
              type="text"
              placeholder="Nombre"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm w-full text-white"
            />
            <input
              required
              type="tel"
              placeholder="Celular (ej. 300123...)"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm w-full text-white"
            />
          </div>
          <input
            type="text"
            placeholder="Vendedor (Opcional)"
            value={formVendor}
            onChange={(e) => setFormVendor(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm w-full text-white"
          />

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            {editingId
              ? 'Guardar Cambios'
              : `Reservar por $${totalPrice.toLocaleString('es-CO')}`}
          </button>
        </form>
      </div>

      {/* Lista de Compradores */}
      <div className="p-4 max-w-2xl mx-auto mb-64 mt-8">
        <h3 className="text-lg font-bold mb-4">Lista de Compradores</h3>
        <div className="space-y-2">
          {buyers.map((b) => (
            <div
              key={b.id}
              className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-bold">
                  {b.name}{' '}
                  <span className="text-zinc-500 font-normal text-sm">
                    ({b.phone})
                  </span>
                </p>
                <p className="text-xs text-emerald-400 font-mono mt-1">
                  {b.numbers.join(', ')}
                </p>
                {b.vendor && (
                  <p className="text-xs text-zinc-500 mt-1">Vend: {b.vendor}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editBuyer(b)}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => deleteBuyer(b.id)}
                  className="p-2 text-red-400 hover:text-red-300 bg-zinc-800 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {buyers.length === 0 && (
            <p className="text-zinc-600 text-center text-sm">
              No hay compras registradas aún.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
