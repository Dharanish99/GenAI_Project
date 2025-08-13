
import React from "react";
import { useProject } from "../context/ProjectContext.jsx";
import TypeIcon from "./TypeIcon.jsx";
import { formatSize } from "../utils/format.js";

export default function FilesPanel() {
	const { files, activeId, setActive, removeFile, clearAllFiles } = useProject();

	if (files.length === 0) {
		return (
			<div className="card fade-in">
				<div className="card-content">
					<h3 style={{ marginTop: 0 }}>No documents uploaded yet</h3>
					<p style={{ color: "var(--text-muted)" }}>
						Upload legal documents to start using AI-powered analysis features.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="card fade-in">
			<div className="card-header">
				<h3 style={{ margin: 0 }}>Uploaded Documents</h3>
				<div className="flex items-center gap-2">
					<span className="badge badge-primary">{files.length} file(s)</span>
					<button 
						className="btn btn-ghost btn-sm" 
						onClick={clearAllFiles}
						aria-label="Remove all files"
					>
						Clear All
					</button>
				</div>
			</div>
			
			<div className="card-content">
				<div className="file-grid">
					{files.map((file) => (
						<div 
							key={file.id} 
							className={`file-card ${activeId === file.id ? 'active' : ''}`}
							onClick={() => setActive(file.id)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									setActive(file.id);
								}
							}}
						>
							<TypeIcon type={file.type} name={file.name} />
							<div className="file-info">
								<div className="file-name">{file.name}</div>
								<div className="file-meta">
									{formatSize(file.size)} • {new Date(file.addedAt).toLocaleDateString()}
								</div>
								{activeId === file.id && (
									<span className="badge badge-success">Active</span>
								)}
							</div>
							<button 
								className="btn btn-ghost btn-sm" 
								onClick={(e) => {
									e.stopPropagation();
									removeFile(file.id);
								}}
								aria-label={`Remove file ${file.name}`}
							>
								Remove
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
