import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, Search, AlertCircle, Info, CheckCircle2, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

// Project-specific custom components
import ThemeGenerator from "@/components/ThemeGenerator";
import { NavLink } from "@/components/NavLink";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { PromotionBadge } from "@/components/PromotionBadge";

// ---------- Section helper ----------
type ExampleProps = { title: string; description?: string; children: React.ReactNode };
const Example = ({ title, description, children }: ExampleProps) => (
  <div className="rounded-xl border border-border bg-card p-5 space-y-3">
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <div className="flex flex-wrap items-center gap-3 pt-1">{children}</div>
  </div>
);

type SectionProps = { id: string; title: string; description?: string; children: React.ReactNode };
const Section = ({ id, title, description, children }: SectionProps) => (
  <section id={id} className="scroll-mt-24 space-y-5">
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
    <div className="grid gap-4 md:grid-cols-2">{children}</div>
  </section>
);

// ---------- Page ----------
const groups: { id: string; label: string }[] = [
  { id: "theme", label: "Theme Generator" },
  { id: "actions", label: "Actions" },
  { id: "forms", label: "Forms" },
  { id: "data-display", label: "Data Display" },
  { id: "navigation", label: "Navigation" },
  { id: "feedback", label: "Feedback" },
  { id: "overlays", label: "Overlays" },
  { id: "layout", label: "Layout" },
  { id: "custom", label: "Project Components" },
];

export default function UIDocs() {
  const { toast } = useToast();
  const [progress] = useState(64);
  const [sliderSingle, setSliderSingle] = useState<number[]>([40]);
  const [sliderRange, setSliderRange] = useState<number[]>([20, 80]);
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(true);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-warm-bg">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">UI Components Documentation</h1>
              <p className="text-xs text-muted-foreground">
                Internal reference for the reusable design system.
              </p>
            </div>
            <Link to="/" className="text-sm text-primary hover:underline">
              ← Back to site
            </Link>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[200px_1fr] gap-8">
          {/* Sidebar nav */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              {groups.map((g) => (
                <Link
                  key={g.id}
                  to={`/ui-docs#${g.id}`}
                  className="block px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                >
                  {g.label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="space-y-12 min-w-0">
            {/* ============ THEME GENERATOR ============ */}
            <section id="theme" className="scroll-mt-24 space-y-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Theme Generator</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Tweak every design token live. Values update across the entire app and persist locally until you reset.
                </p>
              </div>
              <ThemeGenerator />
            </section>

            {/* ============ ACTIONS ============ */}
            <Section id="actions" title="Actions" description="Buttons, toggles and triggers.">

              <Example title="Button variants" description="default · secondary · destructive · outline · ghost · link">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </Example>

              <Example title="Button sizes" description="sm · default · lg · icon">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Like"><Heart className="h-4 w-4" /></Button>
              </Example>

              <Example title="With icon & loading">
                <Button><Mail className="h-4 w-4 mr-2" /> Email</Button>
                <Button disabled><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading</Button>
                <Button disabled>Disabled</Button>
              </Example>

              <Example title="Toggle / Toggle group">
                <Toggle aria-label="Toggle bold">Bold</Toggle>
                <ToggleGroup type="single" defaultValue="a">
                  <ToggleGroupItem value="a">A</ToggleGroupItem>
                  <ToggleGroupItem value="b">B</ToggleGroupItem>
                  <ToggleGroupItem value="c">C</ToggleGroupItem>
                </ToggleGroup>
              </Example>
            </Section>

            {/* ============ FORMS ============ */}
            <Section id="forms" title="Forms" description="Inputs, selects, sliders and choices.">
              <Example title="Input states">
                <div className="w-full space-y-2">
                  <Label htmlFor="i1">Email</Label>
                  <Input id="i1" placeholder="you@example.com" />
                  <Input placeholder="Disabled" disabled />
                  <Input placeholder="With error" aria-invalid className="border-destructive focus-visible:ring-destructive" />
                  <p className="text-xs text-destructive">Email is required.</p>
                </div>
              </Example>

              <Example title="Search input">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search…" className="pl-9" />
                </div>
              </Example>

              <Example title="Textarea">
                <Textarea placeholder="Type your message here." className="w-full" />
              </Example>

              <Example title="Select">
                <Select>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Choose option" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one">One</SelectItem>
                    <SelectItem value="two">Two</SelectItem>
                    <SelectItem value="three">Three</SelectItem>
                  </SelectContent>
                </Select>
              </Example>

              <Example title="Checkbox & Switch">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={checked} onCheckedChange={(v) => setChecked(!!v)} /> Accept terms
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={switchOn} onCheckedChange={setSwitchOn} /> Notifications
                </label>
              </Example>

              <Example title="Radio group">
                <RadioGroup defaultValue="b" className="flex gap-4">
                  {["a", "b", "c"].map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value={v} /> Option {v.toUpperCase()}
                    </label>
                  ))}
                </RadioGroup>
              </Example>

              <Example title="Slider (single)" description={`Value: ${sliderSingle[0]}`}>
                <Slider value={sliderSingle} onValueChange={setSliderSingle} max={100} step={1} className="w-full" />
              </Example>

              <Example title="Slider (range)" description={`Range: ${sliderRange[0]} – ${sliderRange[1]}`}>
                <Slider value={sliderRange} onValueChange={setSliderRange} max={100} step={1} className="w-full" />
              </Example>

              <Example title="Calendar (date picker)">
                <Calendar mode="single" className="rounded-lg border border-border" />
              </Example>
            </Section>

            {/* ============ DATA DISPLAY ============ */}
            <Section id="data-display" title="Data Display" description="Surfaces and information.">
              <Example title="Badges" description="default · secondary · destructive · outline + status">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge className="bg-green-500/15 text-green-600 border-green-500/30">Available</Badge>
                <Badge className="bg-yellow-500/15 text-yellow-600 border-yellow-500/30">Reserved</Badge>
                <Badge className="bg-red-500/15 text-red-600 border-red-500/30">Sold</Badge>
              </Example>

              <Example title="Avatar">
                <Avatar>
                  <AvatarImage src="https://i.pravatar.cc/80?img=12" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
              </Example>

              <Example title="Card">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Apartment 12-B</CardTitle>
                    <CardDescription>3 rooms · 82 m² · Floor 4</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Premium finishes with city view and balcony.
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">View details</Button>
                  </CardFooter>
                </Card>
              </Example>

              <Example title="Table">
                <Table>
                  <TableCaption>Recent inquiries</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { n: "Anna K.", u: "A-204", s: "Available" },
                      { n: "Mark R.", u: "B-101", s: "Reserved" },
                      { n: "Lena P.", u: "C-308", s: "Sold" },
                    ].map((r) => (
                      <TableRow key={r.u}>
                        <TableCell>{r.n}</TableCell>
                        <TableCell>{r.u}</TableCell>
                        <TableCell className="text-right">{r.s}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Example>

              <Example title="Progress">
                <Progress value={progress} className="w-full" />
                <span className="text-xs text-muted-foreground">{progress}%</span>
              </Example>

              <Example title="Skeleton (loading)">
                <div className="w-full space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </Example>

              <Example title="Empty state">
                <div className="w-full text-center py-8 border border-dashed border-border rounded-xl">
                  <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">No results found</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your filters.</p>
                </div>
              </Example>

              <Example title="Aspect ratio">
                <AspectRatio ratio={16 / 9} className="w-full bg-secondary rounded-lg overflow-hidden">
                  <img src="https://picsum.photos/600/400" alt="Sample" className="object-cover w-full h-full" />
                </AspectRatio>
              </Example>
            </Section>

            {/* ============ NAVIGATION ============ */}
            <Section id="navigation" title="Navigation">
              <Example title="Tabs">
                <Tabs defaultValue="a" className="w-full">
                  <TabsList>
                    <TabsTrigger value="a">Overview</TabsTrigger>
                    <TabsTrigger value="b">Details</TabsTrigger>
                    <TabsTrigger value="c">Reviews</TabsTrigger>
                  </TabsList>
                  <TabsContent value="a" className="text-sm text-muted-foreground pt-3">Overview content.</TabsContent>
                  <TabsContent value="b" className="text-sm text-muted-foreground pt-3">Details content.</TabsContent>
                  <TabsContent value="c" className="text-sm text-muted-foreground pt-3">Reviews content.</TabsContent>
                </Tabs>
              </Example>

              <Example title="Accordion">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="1">
                    <AccordionTrigger>What is included?</AccordionTrigger>
                    <AccordionContent>All finishes, parking and storage.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="2">
                    <AccordionTrigger>Payment terms?</AccordionTrigger>
                    <AccordionContent>Flexible installment plans available.</AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Example>

              <Example title="Breadcrumb">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink href="/explorer">Explorer</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>Unit A-204</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </Example>

              <Example title="Pagination">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                    <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationEllipsis /></PaginationItem>
                    <PaginationItem><PaginationNext href="#" /></PaginationItem>
                  </PaginationContent>
                </Pagination>
              </Example>
            </Section>

            {/* ============ FEEDBACK ============ */}
            <Section id="feedback" title="Feedback">
              <Example title="Alert variants">
                <Alert className="w-full">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Heads up</AlertTitle>
                  <AlertDescription>This is an informational alert.</AlertDescription>
                </Alert>
                <Alert variant="destructive" className="w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Something went wrong.</AlertDescription>
                </Alert>
              </Example>

              <Example title="Toasts">
                <Button onClick={() => toast({ title: "Saved", description: "Your changes have been saved." })}>
                  Show toast
                </Button>
                <Button variant="outline" onClick={() => sonnerToast.success("Success via Sonner")}>
                  Sonner toast
                </Button>
              </Example>

              <Example title="Tooltip">
                <Tooltip>
                  <TooltipTrigger asChild><Button variant="outline">Hover me</Button></TooltipTrigger>
                  <TooltipContent>Helpful hint</TooltipContent>
                </Tooltip>
              </Example>

              <Example title="Loader">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading…</span>
              </Example>
            </Section>

            {/* ============ OVERLAYS ============ */}
            <Section id="overlays" title="Overlays">
              <Example title="Dialog (modal)">
                <Dialog>
                  <DialogTrigger asChild><Button>Open dialog</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm action</DialogTitle>
                      <DialogDescription>Are you sure you want to proceed?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Example>

              <Example title="Sheet (side drawer)">
                <Sheet>
                  <SheetTrigger asChild><Button variant="outline">Open sheet</Button></SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Settings</SheetTitle>
                      <SheetDescription>Adjust your preferences.</SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </Example>

              <Example title="Drawer (bottom)">
                <Drawer>
                  <DrawerTrigger asChild><Button variant="outline">Open drawer</Button></DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Drawer title</DrawerTitle>
                      <DrawerDescription>Mobile-friendly bottom sheet.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 text-sm text-muted-foreground">Body content.</div>
                  </DrawerContent>
                </Drawer>
              </Example>

              <Example title="Popover">
                <Popover>
                  <PopoverTrigger asChild><Button variant="outline">Open popover</Button></PopoverTrigger>
                  <PopoverContent className="text-sm">Quick contextual content.</PopoverContent>
                </Popover>
              </Example>

              <Example title="Hover card">
                <HoverCard>
                  <HoverCardTrigger asChild><Button variant="link">@komitas</Button></HoverCardTrigger>
                  <HoverCardContent className="text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Verified developer
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </Example>
            </Section>

            {/* ============ LAYOUT ============ */}
            <Section id="layout" title="Layout">
              <Example title="Separator">
                <div className="w-full">
                  <div className="text-sm">Above</div>
                  <Separator className="my-2" />
                  <div className="text-sm">Below</div>
                </div>
              </Example>

              <Example title="Scroll area">
                <ScrollArea className="h-32 w-full rounded-lg border border-border p-3 text-sm">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <p key={i} className="py-1">Row #{i + 1}</p>
                  ))}
                </ScrollArea>
              </Example>
            </Section>

            {/* ============ PROJECT-SPECIFIC COMPONENTS ============ */}
            <Section
              id="custom"
              title="Project Components"
              description="Custom components built specifically for this project."
            >
              <Example title="NavLink" description="Router-aware link with active/pending class hooks.">
                <NavLink
                  to="/ui-docs"
                  className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground"
                  activeClassName="bg-primary text-primary-foreground"
                >
                  UI Docs (active)
                </NavLink>
                <NavLink
                  to="/non-existent"
                  className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground"
                  activeClassName="bg-primary text-primary-foreground"
                >
                  Inactive link
                </NavLink>
              </Example>

              <Example title="LanguageSwitcher" description="HY / RU / EN locale toggle (uses i18next).">
                <div className="rounded-lg bg-navy p-3">
                  <LanguageSwitcher />
                </div>
              </Example>

              <Example title="PromotionBadge — types" description="discount · hot · new · mortgage · installment · limited · custom">
                <PromotionBadge type="discount" label="-15%" />
                <PromotionBadge type="hot" label="Hot" />
                <PromotionBadge type="new" label="New" />
                <PromotionBadge type="mortgage" label="Mortgage" />
                <PromotionBadge type="installment" label="0% installment" />
                <PromotionBadge type="limited" label="Limited" />
                <PromotionBadge type="custom" label="Special" />
              </Example>

              <Example title="PromotionBadge — sizes" description="sm · md · lg">
                <PromotionBadge type="discount" size="sm" label="Small" />
                <PromotionBadge type="discount" size="md" label="Medium" />
                <PromotionBadge type="discount" size="lg" label="Large" />
              </Example>

              <Example
                title="Apartment status badges"
                description="Color-coded statuses used across the Explorer and listings."
              >
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[hsl(var(--status-available))] text-[hsl(var(--status-available-fg))]">
                  Available
                </span>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[hsl(var(--status-reserved))] text-[hsl(var(--status-reserved-fg))]">
                  Reserved
                </span>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[hsl(var(--status-sold))] text-[hsl(var(--status-sold-fg))]">
                  Sold
                </span>
              </Example>

              <Example title="Glass surfaces" description=".glass and .glass-dark utility classes.">
                <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-navy to-navy-light">
                  <div className="absolute inset-4 glass rounded-lg flex items-center justify-center text-sm text-primary-foreground">
                    .glass
                  </div>
                </div>
                <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gold-light">
                  <div className="absolute inset-4 glass-dark rounded-lg flex items-center justify-center text-sm text-gold-light">
                    .glass-dark
                  </div>
                </div>
              </Example>

              <Example title="Brand gradients" description=".gradient-gold · .gradient-navy · .text-gradient-gold">
                <div className="w-full grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-lg gradient-gold flex items-center justify-center text-sm font-semibold text-navy">
                    gradient-gold
                  </div>
                  <div className="h-20 rounded-lg gradient-navy flex items-center justify-center text-sm font-semibold text-gold">
                    gradient-navy
                  </div>
                </div>
                <div className="w-full text-3xl font-bold text-gradient-gold bg-navy px-4 py-3 rounded-lg text-center">
                  text-gradient-gold
                </div>
              </Example>

              <Example
                title="Section divider"
                description=".section-divider — decorative gold accent used above section titles."
              >
                <div className="w-full section-divider pt-4 text-center">
                  <h3 className="text-xl">Section heading</h3>
                </div>
              </Example>

              <Example
                title="Other project components"
                description="Composite components — preview in their natural pages."
              >
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  <li><code className="font-mono">Header</code>, <code className="font-mono">Footer</code> — global layout (see any page)</li>
                  <li><code className="font-mono">ChatWidget</code> — floating chat (Explorer V2)</li>
                  <li><code className="font-mono">PromoTopBanner</code>, <code className="font-mono">PromoPopup</code>, <code className="font-mono">PromotionsSection</code> — promotions surfaces</li>
                  <li><code className="font-mono">explorer/InteractiveSvg</code>, <code className="font-mono">explorer/BuildingMatrix</code>, <code className="font-mono">explorer/ApartmentDetailsSheet</code> — Explorer V2 building blocks</li>
                  <li><code className="font-mono">sections/*</code> — Hero, About, Amenities, BankPartners, Documents, Gallery, Location, Video, ContactForm</li>
                </ul>
              </Example>
            </Section>



            <footer className="text-xs text-muted-foreground pt-8 border-t border-border">
              Internal documentation · extend by adding new <code className="px-1 rounded bg-secondary">Example</code> blocks inside a <code className="px-1 rounded bg-secondary">Section</code>.
            </footer>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
