'use client';

interface ColorPickerProps {
  onSelectColor: (color: string) => void;
}

export default function ColorPicker({ onSelectColor }: ColorPickerProps) {
  const colors = [
    { name: 'Red', value: 'rgb(255, 6, 0)', class: 'bg-red-600' },
    { name: 'Green', value: 'rgb(0, 170, 69)', class: 'bg-green-600' },
    { name: 'Blue', value: 'rgb(0, 150, 224)', class: 'bg-blue-500' },
    { name: 'Yellow', value: 'rgb(255, 222, 0)', class: 'bg-yellow-400' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Select a color:</h2>
        <div className="flex gap-4">
          {colors.map(color => (
            <button
              key={color.name}
              onClick={() => onSelectColor(color.value)}
              className={`w-20 h-20 rounded-full ${color.class} hover:scale-110 transition-transform shadow-lg`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}