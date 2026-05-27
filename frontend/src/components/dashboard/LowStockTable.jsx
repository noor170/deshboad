import { decimal } from "../../constants/utils";

export default function LowStockTable({
  products,
  pagination,
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  tableError,
}) {
  return (
    <div className="forecast-table-panel">
      <div className="forecast-table-header">
        <div>
          <p className="forecast-kicker">Low-Stock Queue</p>
          <h2>Server-side paginated inventory alerts</h2>
        </div>
        <div className="forecast-pagination-meta">
          Page {pagination?.page || currentPage} of {totalPages}
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

      <div className="forecast-pagination">
        <button
          type="button"
          className="forecast-page-button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={!hasPrevious}
        >
          Previous
        </button>
        <button
          type="button"
          className="forecast-page-button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={!hasNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
