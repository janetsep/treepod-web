export default function ComoFunciona() {
  return (
    <section className="py-12 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">¿Cómo funciona la reserva?</h2>

      <ol className="list-decimal list-inside space-y-2 text-gray-700">
        <li>Eliges tus fechas</li>
        <li>Pagas el 50% para confirmar tu reserva</li>
        <li>El saldo se paga al llegar</li>
      </ol>

      <p className="mt-4 text-sm text-gray-600">
        El pago se realiza de forma segura a través de Webpay.
      </p>
    </section>
  );
}
