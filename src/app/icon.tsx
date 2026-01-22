import { ImageResponse } from "next/og"

export const size = {
	height: 32,
	width: 32,
}
export const contentType = "image/png"

export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				alignItems: "center",
				background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
				borderRadius: "6px",
				display: "flex",
				height: "100%",
				justifyContent: "center",
				width: "100%",
			}}
		>
			<svg
				fill="none"
				height="20"
				stroke="white"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2.5}
				viewBox="0 0 24 24"
				width="20"
			>
				<path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
			</svg>
		</div>,
		{
			...size,
		},
	)
}
