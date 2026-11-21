// The top of a page: the title on the left, controls (like a month picker) on the right.
function PageHeader({ title, children }) {
  return (
    <header className='page-header'>
      <h1>{title}</h1>
      <div className='page-header-right'>{children}</div>
    </header>
  )
}

export default PageHeader
