import React, { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import { formatCurrency } from "./utils/formatCurrency"

interface Startup {
  Company: string
  Sector: string
  "Founded Date": number
  "Amount Raised (USD)": string
  Headquarters: string
  Founders: string
  Country: string
}

const startupData: Startup[] = [
  {
    Company: "Serentica Renewables",
    Sector: "Clean Tech",
    "Founded Date": 2022,
    "Amount Raised (USD)": "$1.45 Bn+",
    Headquarters: "Gurugram",
    Founders: "N/A",
    Country: "India",
  },
  {
    Company: "Neso Brands",
    Sector: "Ecommerce",
    "Founded Date": 2022,
    "Amount Raised (USD)": "$100.00 Mn+",
    Headquarters: "Singapore",
    Founders: "Bjorn Bergstrom; Peyush Bansal",
    Country: "Singapore",
  },
  {
    Company: "Ola Krutrim",
    Sector: "AI",
    "Founded Date": 2023,
    "Amount Raised (USD)": "$74.00 Mn+",
    Headquarters: "Bengaluru",
    Founders: "Bhavish Aggarwal",
    Country: "India",
  },
  // ... (include all other startup data here)
]

export default function StartupDataTable() {
  const [sortColumn, setSortColumn] = useState<keyof Startup>("Company")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filter, setFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const sortedAndFilteredData = useMemo(() => {
    return startupData
      .filter((startup) =>
        Object.values(startup).some((value) => value && value.toString().toLowerCase().includes(filter.toLowerCase())),
      )
      .sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
  }, [sortColumn, sortDirection, filter])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedAndFilteredData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedAndFilteredData, currentPage])

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage)

  const handleSort = (column: keyof Startup) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Startups incorporated from 2022 and got funded</h1>
      <Input
        placeholder="Filter startups..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            {Object.keys(startupData[0]).map((key) => (
              <TableHead key={key} className="cursor-pointer" onClick={() => handleSort(key as keyof Startup)}>
                {key}
                <Button variant="ghost" className="ml-2 h-8 w-8 p-0">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((startup, index) => (
            <TableRow key={index}>
              <TableCell>{startup.Company}</TableCell>
              <TableCell>{startup.Sector}</TableCell>
              <TableCell>{startup["Founded Date"]}</TableCell>
              <TableCell>{formatCurrency(startup["Amount Raised (USD)"])}</TableCell>
              <TableCell>{startup.Headquarters}</TableCell>
              <TableCell>{startup.Founders}</TableCell>
              <TableCell>{startup.Country}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, sortedAndFilteredData.length)} of {sortedAndFilteredData.length} entries
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            <ChevronDown className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

