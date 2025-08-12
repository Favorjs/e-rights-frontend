import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Download, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { PDFDocument, rgb } from 'pdf-lib';
const ShareholderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shareholder, setShareholder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShareholder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/shareholders/${id}`);
        
        if (response.data.success) {
          setShareholder(response.data.data);
        } else {
          setError('Failed to load shareholder details');
        }
      } catch (error) {
        console.error('Error fetching shareholder:', error);
        setError('Error loading shareholder details');
        toast.error('Error loading shareholder details');
      } finally {
        setLoading(false);
      }
    };

    fetchShareholder();
  }, [id]);

  const handleDigitalForm = () => {
    navigate(`/digital-form/${id}`);
  };

  // const handleDownloadPhysicalForm = async () => {
  //   try {
  //     toast.loading('Preparing your form...');
      
  //     // Fetch the PDF template
  //     const pdfUrl = '/forms/TIP RIGHTS ISSUE SAMPLE.pdf';
  //     const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      
  //     // Load the PDF document
  //     const pdfDoc = await PDFDocument.load(existingPdfBytes);
  //     const pages = pdfDoc.getPages();
  //     const firstPage = pages[0];
      
  //     // Get the form fields
  //     const form = pdfDoc.getForm();
      
  //     // Fill in the form fields with shareholder data
  //     try {
  //       // These field names need to match exactly what's in your PDF
  //       form.getTextField('shareholderName').setText(shareholder.name);
  //   form.getTextField('holdingsCount').setText(shareholder.holdings.toLocaleString());
  //   form.getTextField('rightsIssue').setText(shareholder.rights_issue.toLocaleString());
  //   form.getTextField('amountDue').setText(`₦${shareholder.amount_due.toLocaleString()}`);
    
  //       // Flatten the form to make the fields read-only
  //       form.flatten();
  //     } catch (error) {
  //       console.warn('Could not fill PDF form fields:', error);
  //       // Fallback: Draw text directly on the page if form fields aren't found
  //       const { width, height } = firstPage.getSize();
        
  //       firstPage.drawText(`Name: ${shareholder.name}`, {
  //         x: 50,
  //         y: height - 150,
  //         size: 12,
  //         color: rgb(0, 0, 0),
  //       });
        
  //       firstPage.drawText(`Holdings: ${shareholder.holdings}`, {
  //         x: 50,
  //         y: height - 170,
  //         size: 12,
  //         color: rgb(0, 0, 0),
  //       });
        
  //       firstPage.drawText(`Rights Issue: ${shareholder.rights_issue}`, {
  //         x: 50,
  //         y: height - 190,
  //         size: 12,
  //         color: rgb(0, 0, 0),
  //       });
        
  //       firstPage.drawText(`Amount Due: ${shareholder.amount_due}`, {
  //         x: 50,
  //         y: height - 210,
  //         size: 12,
  //         color: rgb(0, 0, 0),
  //       });
  //     }
      
  //     // Save the modified PDF
  //     const pdfBytes = await pdfDoc.save();
      
  //     // Create download link
  //     const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  //     const link = document.createElement('a');
  //     link.href = URL.createObjectURL(blob);
  //     link.download = `TIP_RIGHTS_ISSUE_${shareholder.name.replace(/\s+/g, '_')}.pdf`;
      
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
      
  //     toast.dismiss();
  //     toast.success('Form downloaded with your details!');
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //     toast.dismiss();
  //     toast.error('Failed to generate form');
  //   }
  // };

  const handleDownloadPhysicalForm = async () => {
    try {
      toast.loading('Generating your form...');
      
      const response = await axios.post(
        '/api/forms/generate-rights-form',
        {
          shareholderName: shareholder.name,
          holdings: shareholder.holdings,
          rightsIssue: shareholder.rights_issue,
          amountDue: shareholder.amount_due
        },
        { 
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `TIP_RIGHTS_${shareholder.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
      
      toast.dismiss();
      toast.success('Form downloaded with your details!');
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to generate form');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shareholder details...</p>
        </div>
      </div>
    );
  }

  if (error || !shareholder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Shareholder not found'}</p>
          <Link to="/" className="btn-primary">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Search
          </Link>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="text-green-600">Search</span>
            <span>/</span>
            <span>Shareholder Details</span>
          </div>
        </div>

        {/* Shareholder Information */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shareholder Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">REG ACCOUNT NUMBER</label>
                <p className="text-lg font-semibold text-gray-900">{shareholder.reg_account_number}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">NAME</label>
                <p className="text-lg font-semibold text-gray-900">{shareholder.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">HOLDINGS</label>
                <p className="text-lg font-semibold text-gray-900">{shareholder.holdings.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">RIGHTS ISSUE</label>
                <p className="text-lg font-semibold text-gray-900">{shareholder.rights_issue}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">HOLDINGS AFTER</label>
                <p className="text-lg font-semibold text-green-600">{shareholder.holdings_after.toLocaleString()}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">AMOUNT DUE</label>
                <p className="text-lg font-semibold text-green-600">{shareholder.amount_due.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Choose Your Option */}
        <div className="card">
          {/* <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Your Option</h2> */}
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* Digital Form Option */}
            {/* <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fill Digital Form</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete the acceptance/renunciation form online with file uploads
              </p>
              
              <button
                onClick={handleDigitalForm}
                className="w-full btn-primary"
              >
                Continue Online
              </button>
            </div> */}

            {/* Physical Form Option */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-blue-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Rights Issue Form</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download and fill the form, then submit to our email <a href="mailto:registrars@apel.ng" className="text-blue-600 hover:underline">registrars@apel.ng</a> with payment receipt
              </p>
              
              <button
                onClick={handleDownloadPhysicalForm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareholderDetailsPage; 