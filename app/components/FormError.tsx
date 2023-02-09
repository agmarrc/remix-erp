interface Props {
    error: string | undefined;
}

export default function FormError({ error }: Props) {
    if (!error) return null;

    return <p
        className="text-red-500"
        role="alert"
    >
        {error}
    </p>
}