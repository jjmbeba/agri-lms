/** biome-ignore-all lint/style/noMagicNumbers: Temporary file */
"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

const COMPLETION_RATE_HIGH = 85;
const COMPLETION_RATE_MEDIUM = 75;
const PAGE_SIZES = [10, 20, 30, 40, 50] as const;
const CHART_MARGIN_LEFT = 0;
const CHART_MARGIN_RIGHT = 10;
const CHART_TICK_MARGIN = 8;

export const schema = z.object({
  id: z.number(),
  courseName: z.string(),
  instructor: z.string(),
  category: z.string(),
  status: z.string(),
  enrolledStudents: z.number(),
  completionRate: z.string(),
  lastUpdated: z.string(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      className="size-7 text-muted-foreground hover:bg-transparent"
      size="icon"
      variant="ghost"
    >
      <IconGripVertical className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "courseName",
    header: "Course Name",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "instructor",
    header: "Instructor",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.instructor}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge className="px-1.5 text-muted-foreground" variant="outline">
          {row.original.category}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className="px-1.5 text-muted-foreground" variant="outline">
        {row.original.status === "Active" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : (
          <IconLoader />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "enrolledStudents",
    header: () => <div className="w-full text-right">Students</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.original.enrolledStudents.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "completionRate",
    header: () => <div className="w-full text-right">Completion</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Badge
          className={(() => {
            const rate = Number.parseFloat(row.original.completionRate);
            if (rate >= COMPLETION_RATE_HIGH) {
              return "border-green-200 text-green-700";
            }
            if (rate >= COMPLETION_RATE_MEDIUM) {
              return "border-yellow-200 text-yellow-700";
            }
            return "border-red-200 text-red-700";
          })()}
          variant="outline"
        >
          {row.original.completionRate}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {new Date(row.original.lastUpdated).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
            variant="ghost"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>Edit Course</DropdownMenuItem>
          <DropdownMenuItem>View Analytics</DropdownMenuItem>
          <DropdownMenuItem>Manage Students</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      data-dragging={isDragging}
      data-state={row.getIsSelected() && "selected"}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = useState(() => initialData);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((prevData) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(prevData, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs
      className="w-full flex-col justify-start gap-6"
      defaultValue="outline"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label className="sr-only" htmlFor="view-selector">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex @4xl/main:hidden w-fit"
            id="view-selector"
            size="sm"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="past-performance">Past Performance</SelectItem>
            <SelectItem value="key-personnel">Key Personnel</SelectItem>
            <SelectItem value="focus-documents">Focus Documents</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="@4xl/main:flex hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="past-performance">
            Past Performance <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Key Personnel <Badge variant="secondary">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      checked={column.getIsVisible()}
                      className="capitalize"
                      key={column.id}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline">
            <IconPlus />
            <span className="hidden lg:inline">Add Section</span>
          </Button>
        </div>
      </div>
      <TabsContent
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        value="outline"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            id={sortableId}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead colSpan={header.colSpan} key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      className="h-24 text-center"
                      colSpan={columns.length}
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-muted-foreground text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label className="font-medium text-sm" htmlFor="rows-per-page">
                Rows per page
              </Label>
              <Select
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
                value={`${table.getState().pagination.pageSize}`}
              >
                <SelectTrigger className="w-20" id="rows-per-page" size="sm">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {PAGE_SIZES.map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center font-medium text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                className="hidden h-8 w-8 p-0 lg:flex"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.setPageIndex(0)}
                variant="outline"
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                className="size-8"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                size="icon"
                variant="outline"
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                className="size-8"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                size="icon"
                variant="outline"
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                className="hidden size-8 lg:flex"
                disabled={!table.getCanNextPage()}
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                size="icon"
                variant="outline"
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        className="flex flex-col px-4 lg:px-6"
        value="past-performance"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />
      </TabsContent>
      <TabsContent className="flex flex-col px-4 lg:px-6" value="key-personnel">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />
      </TabsContent>
      <TabsContent
        className="flex flex-col px-4 lg:px-6"
        value="focus-documents"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />
      </TabsContent>
    </Tabs>
  );
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button className="w-fit px-0 text-left text-foreground" variant="link">
          {item.courseName}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.courseName}</DrawerTitle>
          <DrawerDescription>
            Course details and student engagement metrics
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: CHART_MARGIN_LEFT,
                    right: CHART_MARGIN_RIGHT,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="month"
                    hide
                    tickFormatter={(value: string) => value.slice(0, 3)}
                    tickLine={false}
                    tickMargin={CHART_TICK_MARGIN}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="dot" />}
                    cursor={false}
                  />
                  <Area
                    dataKey="mobile"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stackId="a"
                    stroke="var(--color-mobile)"
                    type="natural"
                  />
                  <Area
                    dataKey="desktop"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stackId="a"
                    stroke="var(--color-desktop)"
                    type="natural"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 font-medium leading-none">
                  Trending up by 5.2% this month{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Showing total visitors for the last 6 months. This is just
                  some random text to test the layout. It spans multiple lines
                  and should wrap around.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="courseName">Course Name</Label>
              <Input defaultValue={item.courseName} id="courseName" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="instructor">Instructor</Label>
                <Input defaultValue={item.instructor} id="instructor" />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={item.category}>
                  <SelectTrigger className="w-full" id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sustainability">
                      Sustainability
                    </SelectItem>
                    <SelectItem value="Crop Management">
                      Crop Management
                    </SelectItem>
                    <SelectItem value="Soil Science">Soil Science</SelectItem>
                    <SelectItem value="Pest Control">Pest Control</SelectItem>
                    <SelectItem value="Water Management">
                      Water Management
                    </SelectItem>
                    <SelectItem value="Animal Husbandry">
                      Animal Husbandry
                    </SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="enrolledStudents">Enrolled Students</Label>
                <Input
                  defaultValue={item.enrolledStudents.toString()}
                  id="enrolledStudents"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="completionRate">Completion Rate</Label>
                <Input defaultValue={item.completionRate} id="completionRate" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue={item.status}>
                <SelectTrigger className="w-full" id="status">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
