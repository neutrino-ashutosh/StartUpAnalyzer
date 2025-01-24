"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Moon, Sun, Search, Filter } from "lucide-react"
import { MultiSelect } from "@/components/ui/multi-select"

interface Startup {
  Company: string
  Sector: string
  "Founded Date": number
  "Amount Raised (USD)": string
  Headquarters: string
  Founders: string
  Country: string
}

export default function StartupDataTable() {
  const [data, setData] = useState<Startup[]>([])
  const [filteredData, setFilteredData] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<keyof Startup>("Company")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [sectorFilter, setSectorFilter] = useState<string[]>([])
  const [headquartersFilter, setHeadquartersFilter] = useState<string[]>([])
  const [foundedDateRange, setFoundedDateRange] = useState<[number, number]>([2022, 2024])
  const [showCharts, setShowCharts] = useState(false)
  const { theme, setTheme } = useTheme()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/startups")
      if (!res.ok) {
        throw new Error("Failed to fetch data")
      }
      const json = await res.json()
      setData(json.data)
      setFilteredData(json.data)
      setTotalPages(Math.ceil(json.data.length / itemsPerPage))

      const minFoundedDate = Math.min(...json.data.map((s: Startup) => s["Founded Date"]))
      const maxFoundedDate = Math.max(...json.data.map((s: Startup) => s["Founded Date"]))
      setFoundedDateRange([minFoundedDate, maxFoundedDate])
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const filtered = data.filter((startup) => {
      const matchesSearch = Object.values(startup).some((value) =>
        value.toString().toLowerCase().includes(search.toLowerCase()),
      )
      const matchesSector = sectorFilter.length === 0 || sectorFilter.includes(startup.Sector)
      const matchesHeadquarters = headquartersFilter.length === 0 || headquartersFilter.includes(startup.Headquarters)
      const matchesFoundedDate =
        startup["Founded Date"] >= foundedDateRange[0] && startup["Founded Date"] <= foundedDateRange[1]

      return matchesSearch && matchesSector && matchesHeadquarters && matchesFoundedDate
    })

    const sorted = [...filtered].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1
      if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    setFilteredData(sorted)
    setTotalPages(Math.ceil(sorted.length / itemsPerPage))
    setCurrentPage(1)
  }, [data, search, sectorFilter, headquartersFilter, foundedDateRange, itemsPerPage, sortBy, sortOrder])

  const handleSort = (column: keyof Startup) => {
    setSortBy(column)
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const sectorData = React.useMemo(() => {
    const sectors: { [key: string]: number } = {}
    filteredData.forEach((startup) => {
      sectors[startup.Sector] = (sectors[startup.Sector] || 0) + 1
    })
    return Object.entries(sectors).map(([name, value]) => ({ name, value }))
  }, [filteredData])

  const headquartersData = React.useMemo(() => {
    const headquarters: { [key: string]: number } = {}
    filteredData.forEach((startup) => {
      headquarters[startup.Headquarters] = (headquarters[startup.Headquarters] || 0) + 1
    })
    return Object.entries(headquarters)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, Math.min(10, Object.keys(headquarters).length))
  }, [filteredData])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-bold">
              Funded Startups from 2022: Insights, Trends, and Analytics
            </h1>
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2" />
              Filter Startups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search startups..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sector</label>
                <MultiSelect
                  options={Array.from(new Set(data.map((s) => s.Sector))).map((sector) => ({
                    label: sector,
                    value: sector,
                  }))}
                  selected={sectorFilter}
                  onChange={setSectorFilter}
                  placeholder="Filter by Sector"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Headquarters</label>
                <MultiSelect
                  options={Array.from(new Set(data.map((s) => s.Headquarters))).map((hq) => ({
                    label: hq,
                    value: hq,
                  }))}
                  selected={headquartersFilter}
                  onChange={setHeadquartersFilter}
                  placeholder="Filter by Headquarters"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Founded Date Range</label>
                <Slider
                  min={2022}
                  max={2024}
                  step={1}
                  value={foundedDateRange}
                  onValueChange={setFoundedDateRange}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm mt-1">
                  <span>{foundedDateRange[0]}</span>
                  <span>{foundedDateRange[1]}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <Button onClick={() => setShowCharts(!showCharts)}>{showCharts ? "Hide Charts" : "Show Charts"}</Button>
        </div>

        <AnimatePresence>
          {showCharts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sector Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 pb-8">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={sectorData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        innerRadius={60}
                        fill="#8884d8"
                        label
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 25}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Headquarters</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={Math.max(300, headquartersData.length * 40)}>
                    <BarChart
                      data={headquartersData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} interval={0} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Startup List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {Object.keys(data[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 text-left cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleSort(key as keyof Startup)}
                      >
                        {key}
                        {sortBy === key && (sortOrder === "asc" ? " ↑" : " ↓")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((startup, index) => (
                    <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-2">{startup.Company}</td>
                      <td className="px-4 py-2">{startup.Sector}</td>
                      <td className="px-4 py-2">{startup["Founded Date"]}</td>
                      <td className="px-4 py-2">{startup["Amount Raised (USD)"]}</td>
                      <td className="px-4 py-2">{startup.Headquarters}</td>
                      <td className="px-4 py-2">{startup.Founders}</td>
                      <td className="px-4 py-2">{startup.Country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-muted mt-8 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-muted-foreground">
            <a href="mailto:neutrino.ashutosh@gmail.com" className="hover:text-primary transition-colors">
              neutrino.ashutosh@gmail.com
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://www.linkedin.com/in/neutrino-ashutosh/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              LinkedIn Profile
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

