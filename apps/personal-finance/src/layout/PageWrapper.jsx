export default function PageWrapper({ children }) {
    return (
      <div className="w-full h-full max-w-[1200px] mx-auto px-[24px] py-[24px]">
        {children}
      </div>
    )
  }
  