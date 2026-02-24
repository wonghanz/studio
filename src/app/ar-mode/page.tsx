
"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Camera, RefreshCw, Sparkles, Loader2, BookOpen, Mic, PenTool, ChevronLeft, Zap, Info } from 'lucide-react'
import { aiScenarioAnalysis, type AiScenarioAnalysisOutput } from '@/ai/flows/ai-scenario-analysis'

export default function ArModePage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AiScenarioAnalysisOutput | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use the Scene Guide.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    // Draw the current video frame to the canvas
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    const dataUrl = canvasRef.current.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    setIsAnalyzing(true);

    try {
      const examType = (localStorage.getItem('native_exam_target') as 'SPM' | 'MUET') || 'SPM';
      const result = await aiScenarioAnalysis({
        photoDataUri: dataUrl,
        examType
      });
      setAnalysis(result);
      toast({ title: "Analysis complete!", description: "AI has identified the scene." });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Analysis Failed",
        description: "Could not analyze the scene. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetCamera = () => {
    setAnalysis(null);
    setCapturedImage(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">AR Scene Guide</h1>
          <p className="text-sm text-muted-foreground">Capture your world, learn the language.</p>
        </div>
      </header>

      {!analysis ? (
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
            <video 
              ref={videoRef} 
              className={`w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`} 
              autoPlay 
              muted 
              playsInline
            />
            {capturedImage && (
              <img src={capturedImage} className="w-full h-full object-cover" alt="Captured scene" />
            )}
            
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute inset-x-0 bottom-8 flex justify-center">
              {!isAnalyzing ? (
                <Button 
                  onClick={captureAndAnalyze} 
                  disabled={hasCameraPermission === false}
                  className="w-20 h-20 rounded-full bg-white text-primary shadow-2xl hover:bg-secondary active:scale-95 transition-all"
                >
                  <Camera className="w-8 h-8" />
                </Button>
              ) : (
                <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="font-bold text-sm text-primary">AI is analyzing...</span>
                </div>
              )}
            </div>
          </div>

          {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use the Scene Guide feature.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="border-none shadow-sm bg-primary/5">
               <CardContent className="p-4 flex gap-3 items-start">
                 <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <p className="text-xs text-primary-foreground/80 leading-relaxed">
                   <strong>Tip:</strong> Aim at clear actions like a market stall, a road incident, or even your kitchen during cooking!
                 </p>
               </CardContent>
             </Card>
             <Card className="border-none shadow-sm bg-accent/5">
               <CardContent className="p-4 flex gap-3 items-start">
                 <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                 <p className="text-xs text-accent-foreground/80 leading-relaxed">
                   The AI will generate specific vocabulary and tasks based exactly on what you see.
                 </p>
               </CardContent>
             </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative h-48 w-full rounded-2xl overflow-hidden">
             <img src={capturedImage!} className="w-full h-full object-cover" alt="Scene" />
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button variant="secondary" onClick={resetCamera} className="rounded-full gap-2">
                  <RefreshCw className="w-4 h-4" /> Retake Photo
                </Button>
             </div>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="pb-2">
              <Badge className="w-fit mb-2">Scenario Identified</Badge>
              <CardTitle className="text-2xl">{analysis.scenarioTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">{analysis.description}</p>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-bold flex items-center gap-2 text-primary">
                  <Zap className="w-4 h-4" /> Scene Vocabulary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.vocabulary.map((v, i) => (
                    <div key={i} className="bg-secondary/20 p-3 rounded-xl">
                      <p className="font-bold text-sm">{v.word}</p>
                      <p className="text-[10px] opacity-70 mb-1">{v.meaning}</p>
                      <p className="text-[10px] italic">"{v.example}"</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-bold flex items-center gap-2 text-accent">
                  <Mic className="w-4 h-4" /> Speaking Mission
                </h3>
                <p className="text-sm italic opacity-80">{analysis.speakingGuidance}</p>
                <Link href="/speaking">
                  <Button className="w-full mt-2 bg-accent hover:bg-accent/90">Start Speaking Practice</Button>
                </Link>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-bold flex items-center gap-2 text-blue-500">
                  <PenTool className="w-4 h-4" /> Writing Challenge
                </h3>
                <p className="text-sm opacity-80">{analysis.writingTask}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analysis.modelPhrases.map((phrase, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] font-medium py-1">{phrase}</Badge>
                  ))}
                </div>
                <Link href="/writing">
                  <Button className="w-full mt-2" variant="outline">Open Essay Editor</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
