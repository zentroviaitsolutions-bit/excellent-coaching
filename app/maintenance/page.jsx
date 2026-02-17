export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow p-8 text-center">
        <h1 className="text-3xl font-bold">Website Under Maintenance</h1>
        <p className="text-gray-600 mt-3">
          Hum website update kar rahe hain. Thodi der baad try karein.
        </p>

        <div className="mt-6 text-sm text-gray-700">
          <p>If urgent, contact us on WhatsApp.</p>
        </div>

        <a
          href="https://wa.me/917055902068"
          className="inline-block mt-6 px-6 py-3 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700"
        >
          WhatsApp Now
        </a>
      </div>
    </div>
  );
}
