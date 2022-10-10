export default function ErrorMessage({ errMessage }: { errMessage: string }) {
	return (
		<div className="message">
			<span dangerouslySetInnerHTML={{ __html: errMessage }}></span>
		</div>
	)
}