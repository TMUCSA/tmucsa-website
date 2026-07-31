export default function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#25487D]">{eyebrow}</p> : null}
        <h1 className="font-josefin text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[#161329]/55 sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  )
}
