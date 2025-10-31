import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, Palette, Type, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import defaultTemplate from "@/assets/default-template.webp";

interface CellData {
  id: string;
  day: string;
  period: number;
  subject: string;
  bgColor: string;
  textColor: string;
}

interface TemplateConfig {
  name: string;
  periods: string[];
  days: string[];
  breaks: { afterPeriod: number; label: string }[];
  cells: CellData[];
}

export const GraphicalTemplateEditor = ({ onSave }: { onSave: (config: TemplateConfig) => void }) => {
  const [config, setConfig] = useState<TemplateConfig>({
    name: "New Template",
    periods: ["8:30-9:00", "9:00-9:40", "9:40-10:30", "10:50-11:10", "11:10-11:40", "11:40-12:10", "12:30-2:00", "2:00-2:40", "3:20-4:00"],
    days: ["MON", "TUE", "WED", "THUR", "FRI"],
    breaks: [
      { afterPeriod: 3, label: "BREAK" },
      { afterPeriod: 6, label: "LUNCH" },
    ],
    cells: [],
  });

  const [selectedCell, setSelectedCell] = useState<{ day: string; period: number } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    { bg: "hsl(27, 100%, 60%)", text: "hsl(0, 0%, 100%)", name: "Orange" },
    { bg: "hsl(142, 76%, 36%)", text: "hsl(0, 0%, 100%)", name: "Green" },
    { bg: "hsl(189, 67%, 16%)", text: "hsl(0, 0%, 100%)", name: "Teal" },
    { bg: "hsl(42, 47%, 90%)", text: "hsl(189, 67%, 16%)", name: "Cream" },
    { bg: "hsl(0, 84%, 60%)", text: "hsl(0, 0%, 100%)", name: "Red" },
  ];

  const getCellData = (day: string, period: number): CellData | undefined => {
    return config.cells.find((cell) => cell.day === day && cell.period === period);
  };

  const updateCell = (day: string, period: number, subject: string, bgColor: string, textColor: string) => {
    const cellId = `${day}-${period}`;
    const existingIndex = config.cells.findIndex((c) => c.id === cellId);

    if (existingIndex >= 0) {
      const newCells = [...config.cells];
      newCells[existingIndex] = { id: cellId, day, period, subject, bgColor, textColor };
      setConfig({ ...config, cells: newCells });
    } else {
      setConfig({
        ...config,
        cells: [...config.cells, { id: cellId, day, period, subject, bgColor, textColor }],
      });
    }
  };

  const isBreak = (period: number) => {
    return config.breaks.find((b) => b.afterPeriod === period);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("template-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("template-images")
        .getPublicUrl(filePath);

      setUploadedImage(publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error("Failed to upload image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    toast.success("Template saved successfully!");
    onSave(config);
  };

  return (
    <div className="space-y-6">
      {/* Reference Image Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur-lg opacity-30" />
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Template Design Reference
              </CardTitle>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <img
              src={uploadedImage || defaultTemplate}
              alt="Template Reference"
              className="w-full rounded-lg shadow-lg"
            />
            {uploadedImage && (
              <p className="text-sm text-muted-foreground mt-2">
                Using your uploaded image as reference
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Template Name */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label>Template Name</Label>
            <Input
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              placeholder="Enter template name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Editable Timetable Grid */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="overflow-x-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Editable Timetable Grid
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={editMode ? "default" : "outline"}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Lock" : "Edit Mode"}
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-w-[1000px]">
              {/* Header Row */}
              <div className="grid grid-cols-[100px_repeat(9,1fr)] gap-1 mb-1">
                <div className="bg-success text-success-foreground p-3 text-center font-bold rounded">
                  DAY / TIME
                </div>
                {config.periods.map((time, i) => {
                  const breakData = isBreak(i);
                  if (breakData) {
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-b from-orange-500 to-orange-600 text-white p-3 text-center font-bold rounded flex items-center justify-center"
                      >
                        <span className="writing-mode-vertical transform -rotate-180">
                          {breakData.label}
                        </span>
                      </motion.div>
                    );
                  }
                  return (
                    <div
                      key={i}
                      className="bg-success text-success-foreground p-3 text-center text-sm font-bold rounded"
                    >
                      <div>{time.split("-")[0]}</div>
                      <div className="text-xs opacity-80">{time.split("-")[1]}</div>
                    </div>
                  );
                })}
              </div>

              {/* Day Rows */}
              {config.days.map((day, dayIndex) => (
                <motion.div
                  key={day}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: dayIndex * 0.1 }}
                  className="grid grid-cols-[100px_repeat(9,1fr)] gap-1 mb-1"
                >
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 font-bold rounded flex items-center justify-center">
                    {day}
                  </div>

                  {config.periods.map((_, periodIndex) => {
                    const breakData = isBreak(periodIndex);
                    if (breakData) {
                      return (
                        <div
                          key={periodIndex}
                          className="bg-gradient-to-b from-orange-500 to-orange-600 rounded"
                        />
                      );
                    }

                    const cellData = getCellData(day, periodIndex);
                    const bgColor = cellData?.bgColor || "hsl(27, 100%, 60%)";
                    const textColor = cellData?.textColor || "hsl(0, 0%, 100%)";

                    return (
                      <motion.div
                        key={periodIndex}
                        whileHover={editMode ? { scale: 1.05, zIndex: 10 } : {}}
                        className={`p-3 rounded cursor-pointer relative group transition-all ${
                          editMode ? "ring-2 ring-primary/50" : ""
                        }`}
                        style={{ backgroundColor: bgColor, color: textColor }}
                        onClick={() =>
                          editMode && setSelectedCell({ day, period: periodIndex })
                        }
                      >
                        {editMode && (
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <Plus className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="text-center text-sm font-semibold">
                          {cellData?.subject || "Click to add"}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ))}
            </div>

            {/* Cell Editor */}
            {selectedCell && editMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-accent rounded-lg"
              >
                <h3 className="text-lg font-bold mb-4">
                  Edit Cell: {selectedCell.day} - Period {selectedCell.period + 1}
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Subject</Label>
                    <Input
                      placeholder="Enter subject"
                      defaultValue={getCellData(selectedCell.day, selectedCell.period)?.subject}
                      onBlur={(e) => {
                        const currentCell = getCellData(selectedCell.day, selectedCell.period);
                        updateCell(
                          selectedCell.day,
                          selectedCell.period,
                          e.target.value,
                          currentCell?.bgColor || colors[0].bg,
                          currentCell?.textColor || colors[0].text
                        );
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Background Color</Label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <motion.button
                        key={color.name}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 rounded-lg shadow-lg border-2 border-white"
                        style={{ backgroundColor: color.bg }}
                        onClick={() => {
                          const currentCell = getCellData(selectedCell.day, selectedCell.period);
                          updateCell(
                            selectedCell.day,
                            selectedCell.period,
                            currentCell?.subject || "",
                            color.bg,
                            color.text
                          );
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  className="mt-4"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCell(null)}
                >
                  Close
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
