import { decimal } from "../../constants/utils";
import { Pagination } from "../ui";

export default function LowStockTable({
  products,
  pagination: paginationData,
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  tableError,
}) {
  const totalItems = paginationData?.low_stock_total ?? 0;
  const limit = paginationData?.limit ?? 5;
  const offset = paginationData?.offset ?? 0;
  const startItem = totalItems > 0 ? offset + 1 : 0;
  const endItem = Math.min(offset + limit, totalItems);

  return (
    <div className="forecast-table-panel">
      <div className="forecast-table-header">
        <div>
          <p className="forecast-kicker">Low-Stock Queue</p>
          <h2>Server-side paginated inventory alerts</h2>
        </div>
        <div className="forecast-pagination-info">
          {totalItems > 0 ? (
            <span className="pagination-range">
              Showing {startItem}–{endItem} of {totalItems} products
            </span>
          ) : (
            <span className="pagination-range">No products</span>
          )}
          <span className="pagination-page-meta">
            Page {paginationData?.page || currentPage} of {totalPages}
          </span>
        </div>
      </div>

      <div className="forecast-table-wrap">
        <table className="forecast-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Velocity</th>
              <th>Days Left</th>
            </tr>
          </thead>
          <tbody>
            {products?.length ? (
              products.map((item) => (
                <tr key={item.product_id}>
                  <td>{item.product_name}</td>
                  <td>{item.category}</td>
                  <td>{decimal(item.sales_velocity_30d)} / day</td>
                  <td>{decimal(item.days_of_inventory_left)} days</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="forecast-table-empty">
                  {tableError || "No low-stock products returned for this page."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={paginationData?.page || currentPage}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onPageChange={onPageChange}
      />
    </div>
  );
}
