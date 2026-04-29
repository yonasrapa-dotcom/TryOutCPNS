# TryOutCPNS
TryOut CPNS
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Settings, LogOut, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [city, setCity] = useState(user?.city || '');

  const { data: results = [] } = useQuery({
    queryKey: ['my-results', user?.email],
    queryFn: () => base44.entities.TestResult.filter({ user_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const handleSaveCity = async () => {
    await base44.auth.updateMe({ city });
    setEditOpen(false);
    window.location.reload();
  };

  const chartData = [...results].reverse().slice(-20).map(r => ({
    date: format(new Date(r.created_date), 'dd/MM'),
    score: r.score,
    category: r.category,
  }));

  const categoryStats = ['TWK', 'TIU', 'TKP'].map(cat => {
    const catResults = results.filter(r => r.category === cat);
    const avg = catResults.length > 0 ? Math.round(catResults.reduce((s, r) => s + r.score, 0) / catResults.length) : 0;
    const best = catResults.length > 0 ? Math.max(...catResults.map(r => r.score)) : 0;
    return { category: cat, count: catResults.length, avg, best };
  });

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-card px-5 pt-12 pb-6 md:pt-8 border-b border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-heading font-bold text-xl">
                {(user?.full_name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h1 className="font-heading font-bold text-lg">{user?.full_name || 'Peserta'}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  {user?.city && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {user.city}
                    </span>
                  )}
                  <Badge variant="secondary" className="text-[10px]">{user?.role || 'user'}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Edit Profil</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label>Kota</Label>
                      <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Contoh: Jakarta" className="rounded-xl mt-1.5" />
                    </div>
                    <Button onClick={handleSaveCity} className="w-full rounded-xl">Simpan</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="icon" className="rounded-xl" onClick={() => base44.auth.logout()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 max-w-2xl mx-auto space-y-5">
        {/* Score Trend */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
          <h2 className="font-heading font-bold text-sm mb-4">Tren Skor</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada data tes</p>
          )}
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-3 gap-3">
          {categoryStats.map(s => (
            <div key={s.category} className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 text-center">
              <p className="font-heading font-bold text-xs text-muted-foreground">{s.category}</p>
              <p className="font-heading font-bold text-2xl mt-1">{s.avg}</p>
              <p className="text-[10px] text-muted-foreground">Rata-rata</p>
              <p className="text-[10px] text-accent font-semibold mt-1">Best: {s.best}</p>
            </div>
          ))}
        </div>

        {/* Test History */}
        <div>
          <h2 className="font-heading font-bold text-sm mb-3">Riwayat Tes</h2>
          <div className="space-y-2">
            {results.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada riwayat tes</p>
            )}
            {results.map(r => (
              <Link key={r.id} to={`/result/${r.id}`} className="block bg-card rounded-2xl p-4 shadow-sm border border-border/50 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{r.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(r.created_date), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mt-1">{r.correct_answers}/{r.total_questions} benar</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-heading font-bold text-xl ${r.score >= 70 ? 'text-accent' : r.score >= 50 ? 'text-amber-500' : 'text-destructive'}`}>
                      {r.score}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}